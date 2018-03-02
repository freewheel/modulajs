import { merge, reduce, has, forEach, isFunction, omit } from 'lodash';
import { Debug } from '../../debug';
import { createTreeModel } from '../tree_model';
import { Model } from '../model';
import {
  handleOverrideMethod,
  handleOverrideReceiver
} from './decorator_handlers';
import { OVERRIDE_METHODS_KEY, OVERRIDE_RECEIVERS_KEY } from './decorators';

export function createMetaHandler(metaType) {
  return function handleMeta(baseSpec, extraSpec, key, next) {
    if (key !== metaType) {
      return next();
    }

    const extraMeta = extraSpec[key];
    forEach(extraMeta, (metaValue, metaKey) => {
      Debug.do(() => {
        if (baseSpec && has(baseSpec[key], metaKey)) {
          throw new Error(
            `Error extending ${
              baseSpec.displayName
            }'s ${key}: ${metaKey} already exists in base model, do not override`
          );
        }
      });
    });
    const newMeta = merge({}, baseSpec && baseSpec[key], extraMeta);

    return newMeta;
  };
}

export function createFunctionHandler(metaType) {
  return function handleFunction(baseSpec, extraSpec, key, next) {
    if (key !== metaType) {
      return next();
    }

    const base = baseSpec[key];
    const extra = extraSpec[key];

    if (base && !extra) {
      return base;
    } else if (!base && extra) {
      return extra;
    } else if (base && extra) {
      return function mergedFunc(...args) {
        const baseResult = base.apply(this, args);
        const extraResult = extra.apply(this, args);

        if (baseResult && extraResult) {
          Debug.do(() => {
            forEach(extraResult, (resultValue, resultKey) => {
              if (has(baseResult, resultKey)) {
                throw new Error(
                  `Error extending ${
                    baseSpec.displayName
                  }'s ${key}: ${resultKey} already exists in base model, do not override`
                );
              }
            });
          });
        }

        return {
          ...baseResult,
          ...extraResult
        };
      };
    }

    return null;
  };
}

export function handleDefaults(baseSpec, extraSpec, key, next) {
  const metaType = 'defaults';

  if (key === metaType && baseSpec && isFunction(baseSpec[metaType])) {
    Debug.do(() => {
      throw new Error(
        `Error extending ${
          baseSpec.displayName
        }'s defaults: overriding functional defaults in base model is not supported yet`
      );
    });
    return baseSpec[metaType];
  }

  return createMetaHandler(metaType)(baseSpec, extraSpec, key, next);
}

export function handleDisplayName(baseSpec, extraSpec, key, next) {
  const metaType = 'displayName';
  if (key !== metaType) {
    return next();
  }

  return extraSpec[metaType] || `extend(${baseSpec[metaType]})`;
}

export function handleOtherBinding(baseSpec, extraSpec, key) {
  Debug.do(() => {
    if (has(baseSpec, key)) {
      throw new Error(
        `Error extending ${
          baseSpec.displayName
        }'s extraBindings: ${key} already exists in base model, do not override unless using @overrideMethod or @overrideReceiver`
      );
    }
  });

  return extraSpec[key];
}

const MERGE_SPEC_HANDLERS = [
  createMetaHandler('propTypes'),
  createMetaHandler('localPropTypes'),
  handleDefaults,
  createMetaHandler('contextTypes'),
  createMetaHandler('childContextTypes'),
  createFunctionHandler('getChildContext'),
  createMetaHandler('eventTypes'),
  createMetaHandler('watchEventTypes'),
  createFunctionHandler('watchEvent'),
  createMetaHandler('services'),
  createMetaHandler('delegates'),
  handleOverrideMethod,
  handleOverrideReceiver,
  handleDisplayName,
  handleOtherBinding
];

export function invoke(baseSpec, extraSpec, key, handlers, index = 0) {
  if (index === handlers.length) {
    return null;
  }

  const handler = handlers[index];
  return handler(baseSpec, extraSpec, key, () =>
    invoke(baseSpec, extraSpec, key, handlers, index + 1)
  );
}

export function mergeSpec(baseSpec, extraSpec) {
  const extra = omit(extraSpec, OVERRIDE_METHODS_KEY, OVERRIDE_RECEIVERS_KEY);
  const newSpec = reduce(
    extra,
    (memo, value, key) => {
      const mergedValue = invoke(baseSpec, extraSpec, key, MERGE_SPEC_HANDLERS);
      return merge(memo, { [key]: mergedValue });
    },
    merge({}, baseSpec)
  );

  return newSpec;
}

const extendModel = spec => (BaseModel = Model) => {
  const newSpec = mergeSpec(BaseModel.specification, spec);
  const EnhancedModel = createTreeModel(newSpec, BaseModel);

  return EnhancedModel;
};

export default extendModel;
