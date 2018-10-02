import {
  reduce,
  all,
  keys,
  last,
  is,
  reduceRight,
  toPairs,
  set,
  lensProp,
  append,
  zip,
  take,
  ifElse,
  identity,
  isNil,
  over,
  lensIndex,
  isEmpty,
  always,
  merge,
  pick,
  toUpper,
  when,
  map
} from 'ramda';
import { isImmutableType } from '../immutable';
import createDelegateMethods from './model_concerns/delegations';
import { toJS, toJSON } from './model_concerns/serialization';
import { isModel, markModel } from './model_concerns/is_model';
import {
  extractChildModels,
  extractChildModelsRecursively
} from './model_concerns/child_models';
import {
  ensureValidators,
  checkValues,
  checkKeys
} from './model_concerns/validations';
import {
  getPathFromRoot,
  ensureParentPointerOnChildModels
} from './model_concerns/parent_pointer';
import { getContext, getContextFromAncestors } from './model_concerns/context';
import {
  setInternalInstance,
  inheritMethodsFromInternalInstance
} from './model_concerns/internal_instance';
import freezeProps from './model_concerns/freeze_props';

const DEFAULT_DISPLAY_NAME = '<<anonymous Model>>';

function callOrIdentity(valueToCall) {
  return ifElse(is(Function), f => f(valueToCall), identity);
}

function getValue(attr, key) {
  if (isNil(attr)) {
    return attr;
  } else if (isImmutableType(attr) || isModel(attr)) {
    return attr.get(key);
  } else {
    return attr[key];
  }
}

function setValue(attr, key, value) {
  if (isImmutableType(attr) || isModel(attr)) {
    return attr.set(key, value);
  } else if (is(Array, attr)) {
    return over(lensIndex(key), always(value), attr);
  } else {
    return set(lensProp(key), value, attr);
  }
}

function getPropKeys(model) {
  return keys(model.constructor.defaultProps);
}

function evaluateProps(currentProps, props) {
  return reduce(
    (memo, [key, value]) =>
      merge(memo, {
        [key]: callOrIdentity(currentProps[key])(value)
      }),
    {},
    toPairs(props)
  );
}

function getSendUpdateType(model) {
  const { actionTypes } = model.constructor;

  if (actionTypes && actionTypes.UPDATE) {
    return actionTypes.UPDATE;
  } else {
    return `${toUpper(model.displayName)}_UPDATE`;
  }
}

function getDefaultProps(model) {
  return map(callOrIdentity(undefined), model.constructor.defaultProps);
}

function initProps(model, props) {
  const propKeys = getPropKeys(model);

  return merge(getDefaultProps(model), pick(propKeys, props));
}

function runValidations(model, props) {
  const { propTypes, defaultProps } = model.constructor;
  const contextName = `model ${model.displayName}`;

  checkKeys(defaultProps, props, contextName, 'defaultProps');

  // make prop type checks optional now
  if (!isEmpty(propTypes)) {
    ensureValidators(
      propTypes,
      defaultProps,
      contextName,
      'propTypes',
      'defaultProps'
    );

    checkValues(propTypes, props, contextName, 'prop');
  }
}

const Model = class Model {
  constructor(props = {}, { internalInstance = undefined } = {}) {
    markModel(this);

    this.__props__ = initProps(this, props);
    if (process.env !== 'production') {
      runValidations(this, this.props());
      freezeProps(this.props());
    }

    createDelegateMethods(this, this.constructor.delegates);
    setInternalInstance(this, internalInstance);

    // override methods with the version from internal instance
    // to keep pointer stable
    inheritMethodsFromInternalInstance(this);

    // only set parent pointer when child model doesn't have children
    // force flush will happen at reducer
    ensureParentPointerOnChildModels(this, false);
  }

  get displayName() {
    if (this.constructor.displayName === DEFAULT_DISPLAY_NAME) {
      return this.constructor.name;
    } else {
      return this.constructor.displayName;
    }
  }

  get(key) {
    return this.__props__[key];
  }

  props() {
    return this.__props__;
  }

  // alias for props
  attributes() {
    return this.__props__;
  }

  childModels() {
    return extractChildModels(this);
  }

  childModelsRecursive() {
    return extractChildModelsRecursively(this);
  }

  setMulti(props) {
    const currentProps = this.props();
    const evaluatedProps = evaluateProps(currentProps, props);

    if (process.env !== 'production') {
      runValidations(this, evaluatedProps);
    }

    // all the same, return self
    if (
      all(
        key => currentProps[key] === evaluatedProps[key],
        keys(evaluatedProps)
      )
    ) {
      return this;
    }

    return new this.constructor(merge(currentProps, evaluatedProps), {
      internalInstance: this.__internalInstance__
    });
  }

  set(name, value) {
    return this.setMulti({ [name]: value });
  }

  // alias for set
  mutate(name, value) {
    return this.set(name, value);
  }

  getIn(path) {
    return reduce(getValue, this, path);
  }

  updateIn(path, valueOrMapper) {
    const nodesInRow = reduce(
      (memo, key) => {
        const nextItem = getValue(last(memo), key);

        if (nextItem) {
          return append(nextItem, memo);
        } else {
          throw new Error('Cannot find item in given path');
        }
      },
      [this],
      path
    );

    const oldValue = last(nodesInRow);
    const newValue = callOrIdentity(oldValue)(valueOrMapper);

    if (oldValue === newValue) {
      return this;
    } else {
      return reduceRight(
        ([parent, key], value) => setValue(parent, key, value),
        newValue,
        zip(take(path.length, nodesInRow), path)
      );
    }
  }

  clear() {
    return this.setMulti(getDefaultProps(this));
  }

  getContext(key) {
    return getContext(this, key);
  }

  getChildContext() {
    return {};
  }

  getService(name) {
    return this.__internalInstance__.getService(name);
  }

  getServices() {
    return this.__internalInstance__.getServices();
  }

  // framework level support for dispatch
  // treating it differently make it significantly easier
  // for developers because then we hide the concept of path
  dispatch(action) {
    const dispatch = getContextFromAncestors(this, 'dispatch');

    dispatch({
      ...when(is(String), type => ({ type }))(action),
      path: getPathFromRoot(this)
    });
  }

  // whether two models are both decendants
  // of the same initial model
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

  sendUpdate(name, value) {
    this.dispatch({
      type: getSendUpdateType(this),
      payload: {
        name,
        value
      }
    });
  }

  recvUpdate() {
    return {
      type: getSendUpdateType(this),
      update(model, action) {
        const { name, value } = action.payload;

        return [model.set(name, value)];
      }
    };
  }
};

Model.actionTypes = {};
Model.propTypes = {};
Model.defaultProps = {};
Model.contextTypes = {};
Model.childContextTypes = {};
Model.services = {};
Model.delegates = {};
Model.displayName = DEFAULT_DISPLAY_NAME;

export default Model;
