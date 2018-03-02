import {
  has,
  keys,
  last,
  includes,
  forEach,
  reduceRight,
  reduce,
  isFunction,
  bind,
  size,
  every,
  mapValues
} from 'lodash';
import { createDelegateMethods } from './model_concerns/delegations';
import { toJS, toJSON } from './model_concerns/serialization';
import { markModel } from './model_concerns/is_model';
import {
  extractChildModels,
  extractChildModelsRecursively
} from './model_concerns/child_models';
import {
  ensureValidators,
  checkWithValidators
} from './model_concerns/proptypes';
import {
  ensureParentPointerOnChildModels,
  getPathFromRoot
} from './model_concerns/parent_pointer';
import { getContext, getContextFromAncestors } from './model_concerns/context';
import { bubbleEvent } from './model_concerns/event';
import { InternalInstance } from './model_concerns/internal_instance';
import { Debug } from '../debug';

function getPropAttrKey(key) {
  return `_${key}`;
}

function getPropKeys(model) {
  return keys(model.__propTypes__);
}

function getLocalPropKeys(model) {
  return keys(model.__localPropTypes__);
}

function getDefaultValue(model, key, props) {
  const defaultValue = model.__defaultProps__[key];

  if (typeof defaultValue === 'function') {
    return defaultValue.call(model, props);
  } else {
    return defaultValue;
  }
}

function extractAttrs(model, attributes) {
  const attrs = {};
  const localAttrs = {};
  const propKeys = getPropKeys(model);
  const localPropKeys = getLocalPropKeys(model);

  forEach(attributes, (value, key) => {
    if (includes(propKeys, key)) {
      attrs[key] = value;
    } else if (includes(localPropKeys, key)) {
      localAttrs[key] = value;
    }
  });

  return { attrs, localAttrs };
}

function mergeExtraBindings(model, bindings) {
  forEach(bindings, (bindingValue, bindingName) => {
    if (model.__internalInstance__.hasBinding(bindingName)) {
      model[bindingName] = model.__internalInstance__.getBinding(bindingName);
    } else if (isFunction(bindingValue)) {
      model[bindingName] = bind(bindingValue, model);
    } else {
      model[bindingName] = bindingValue;
    }
  });
}

function initAttributes(model, props) {
  const propKeys = getPropKeys(model);

  forEach(propKeys, key => {
    const pk = getPropAttrKey(key);

    if (has(props, key)) {
      model[pk] = props[key];
    } else {
      model[pk] = getDefaultValue(model, key, props);
    }
  });
}

export class Model {
  constructor({
    props = {},
    defaultProps = {},
    propTypes = {},
    localPropTypes = {},
    contextTypes = {},
    childContextTypes = {},
    eventTypes = [],
    watchEventTypes = [],
    services = {},
    delegates = {},
    displayName = '<<anonymous Model>>',
    extraBindings = {},
    internalInstance = null
  }) {
    markModel(this);

    this.__defaultProps__ = isFunction(defaultProps)
      ? defaultProps(props)
      : defaultProps;
    this.__propTypes__ = propTypes;
    this.__localPropTypes__ = localPropTypes;
    this.__contextTypes__ = contextTypes;
    this.__childContextTypes__ = childContextTypes;
    this.__eventTypes__ = eventTypes;
    this.__watchEventTypes__ = watchEventTypes;
    this.__services__ = services;
    this.__delegates__ = delegates;
    this.__displayName__ = displayName;
    this.__extraBindings__ = extraBindings;

    if (!internalInstance) {
      const localProps = reduce(
        localPropTypes,
        (memo, value, key) => ({
          ...memo,
          [key]: has(props, key)
            ? props[key]
            : getDefaultValue(this, key, props)
        }),
        {}
      );

      this.__internalInstance__ = new InternalInstance(
        extraBindings,
        services,
        localProps
      ).setLatestInstance(this);
    } else {
      this.__internalInstance__ = internalInstance.setLatestInstance(this);
    }

    initAttributes(this, props);
    createDelegateMethods(this, delegates);
    mergeExtraBindings(this, extraBindings);

    ensureParentPointerOnChildModels(this);

    Debug.do(() => {
      this.ensurePropsUnique(propTypes, localPropTypes, `model ${displayName}`);

      const allPropTypes = { ...propTypes, ...localPropTypes };

      ensureValidators(
        allPropTypes,
        this.__defaultProps__,
        `model ${displayName}`,
        `propTypes${size(localPropTypes) > 0 ? ' or localPropTypes' : ''}`,
        'defaultProps'
      );

      checkWithValidators(
        allPropTypes,
        this.attributes(),
        `model ${displayName}`,
        'prop'
      );

      /* need to prompt error when passing value via constructor
      to a prop that is not defined in propTypes */
      this.validateProps(props, allPropTypes, `model ${displayName}`);
    });
  }

  get displayName() {
    return this.__displayName__;
  }

  get propTypes() {
    return this.__propTypes__;
  }

  get localPropTypes() {
    return this.__localPropTypes__;
  }

  get contextTypes() {
    return this.__contextTypes__;
  }

  get childContextTypes() {
    return this.__childContextTypes__;
  }

  get eventTypes() {
    return this.__eventTypes__;
  }

  get watchEventTypes() {
    return this.__watchEventTypes__;
  }

  get(attribute) {
    const localPropKeys = getLocalPropKeys(this);
    if (includes(localPropKeys, attribute)) {
      return this.__internalInstance__.getLocalProps().get(attribute);
    }

    const pk = getPropAttrKey(attribute);
    return this[pk];
  }

  attributes() {
    const propKeys = getPropKeys(this);
    const localPropKeys = getLocalPropKeys(this);

    return reduce(
      [...propKeys, ...localPropKeys],
      (memo, key) => {
        memo[key] = this.get(key);
        return memo;
      },
      {}
    );
  }

  childModels() {
    return extractChildModels(this);
  }

  childModelsRecursive() {
    return extractChildModelsRecursively(this);
  }

  updateLocalProps(localAttrs) {
    if (size(localAttrs) > 0) {
      const localProps = this.__internalInstance__.getLocalProps();
      const parsedLocalAttrs = mapValues(
        localAttrs,
        (attr, key) => (isFunction(attr) ? attr(localProps.get(key)) : attr)
      );

      Debug.do(() => {
        checkWithValidators(
          this.__localPropTypes__,
          parsedLocalAttrs,
          `model ${this.displayName}`,
          'prop'
        );
      });

      this.__internalInstance__.updateLocalProps(parsedLocalAttrs);
    }
  }

  shouldCreateNewInstance(attrs) {
    if (size(attrs) === 0) {
      return false;
    }
    if (every(attrs, (value, key) => this.get(key) === value)) {
      return false;
    }
    return true;
  }

  setMulti(attributes) {
    Debug.do(() => {
      this.validateProps(
        attributes,
        { ...this.propTypes, ...this.localPropTypes },
        `model ${this.displayName}`
      );
    });

    const { localAttrs, attrs } = this.extractAttrs(attributes);

    this.updateLocalProps(localAttrs);
    if (!this.shouldCreateNewInstance(attrs)) {
      return this;
    }

    return new Model({
      props: this.mergeAttributes(attrs),
      defaultProps: this.__defaultProps__,
      propTypes: this.__propTypes__,
      localPropTypes: this.__localPropTypes__,
      contextTypes: this.__contextTypes__,
      childContextTypes: this.__childContextTypes__,
      eventTypes: this.__eventTypes__,
      watchEventTypes: this.__watchEventTypes__,
      services: this.__services__,
      delegates: this.__delegates__,
      displayName: this.__displayName__,
      extraBindings: this.__extraBindings__,
      internalInstance: this.__internalInstance__
    });
  }

  set(attribute, value) {
    return this.setMulti({ [attribute]: value });
  }

  mutate(attribute, value) {
    return this.setMulti({ [attribute]: value });
  }

  ensurePropsUnique(propTypes, localPropTypes, contextName) {
    const propKeys = keys(propTypes);
    const localPropKeys = keys(localPropTypes);

    forEach(localPropKeys, localKey => {
      if (includes(propKeys, localKey)) {
        throw new Error(
          `Local prop key "${localKey}" already existed in props of ${contextName}`
        );
      }
    });
  }

  validateProps(validators, propTypes, contextName) {
    const validatorKeys = keys(validators);
    const propsKeys = keys(propTypes);

    forEach(validatorKeys, key => {
      if (!includes(propsKeys, key)) {
        throw new Error(
          `Setting property ${key} on ${contextName} which is not defined in propTypes`
        );
      }
    });
  }

  extractAttrs(attributes) {
    return extractAttrs(this, attributes);
  }

  mergeAttributes(attributes) {
    const originalAttrs = this.attributes();
    const calculatedNewAttributes = reduce(
      attributes,
      (memo, value, key) => {
        if (isFunction(value)) {
          return {
            ...memo,
            [key]: value(originalAttrs[key])
          };
        } else {
          return {
            ...memo,
            [key]: value
          };
        }
      },
      {}
    );

    return {
      ...originalAttrs,
      ...calculatedNewAttributes
    };
  }

  getIn(path) {
    return reduce(
      path,
      (memo, key) => {
        if (memo && memo.get) {
          return memo.get(key);
        } else {
          return undefined;
        }
      },
      this
    );
  }

  updateIn(path, valueOrMutator) {
    const parentsInRow = reduce(
      path,
      (memo, key) => {
        const lastInRow = last(memo);
        return memo.concat(lastInRow.get(key));
      },
      [this]
    );

    let newValue = valueOrMutator;

    if (isFunction(valueOrMutator)) {
      const oldVal = parentsInRow[path.length - 1].get(last(path));
      newValue = valueOrMutator(oldVal);
    }

    return reduceRight(
      path,
      (memo, key, index) => parentsInRow[index].set(key, memo),
      newValue
    );
  }

  clear() {
    const propKeys = getPropKeys(this);

    const attrs = reduce(
      propKeys,
      (memo, key) => {
        memo[key] = getDefaultValue(this, key, {});
        return memo;
      },
      {}
    );

    return this.setMulti(attrs);
  }

  getContext(key) {
    return getContext(this, key);
  }

  getService(name) {
    return this.__internalInstance__.getService(name);
  }

  getServices() {
    return this.__internalInstance__.getServices();
  }

  bubbleEvent(type, payload) {
    return bubbleEvent(this, type, payload);
  }

  // framework level support for dispatch
  // treating it differently make it significantly easier
  // for developers because then we hide the concept of path
  dispatch(action) {
    const dispatch = getContextFromAncestors(this, 'dispatch');

    dispatch({
      ...action,
      path: getPathFromRoot(this)
    });
  }

  isPeer(model) {
    return this.__internalInstance__ === model.__internalInstance__;
  }

  toJS() {
    return toJS(this);
  }

  toJSON() {
    return {
      ...toJSON(this),
      path: getPathFromRoot(this)
    };
  }
}
