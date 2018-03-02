import { has, isFunction, includes } from 'lodash';
import { Debug } from '../../debug';
import { OVERRIDE_METHODS_KEY, OVERRIDE_RECEIVERS_KEY } from './decorators';

function validateOverride(baseSpec, key, value) {
  Debug.do(() => {
    if (!baseSpec) {
      throw new Error(
        'Error overriding base model\'s extraBindings: base model is missing'
      );
    }
    if (!isFunction(value)) {
      throw new Error(
        `Error overriding ${
          baseSpec.displayName
        }'s extraBindings: ${key} is not a function`
      );
    }
    if (!has(baseSpec, key)) {
      throw new Error(
        `Error overriding ${
          baseSpec.displayName
        }'s extraBindings: ${key} is missing in base model`
      );
    }
    if (!isFunction(baseSpec[key])) {
      throw new Error(
        `Error overriding ${
          baseSpec.displayName
        }'s extraBindings: ${key} is not a function in base model`
      );
    }
  });
}

export function handleOverrideMethod(baseSpec, extraSpec, key, next) {
  if (includes(extraSpec[OVERRIDE_METHODS_KEY], key)) {
    const value = extraSpec[key];

    validateOverride(baseSpec, key, value);

    return function newFun(...args) {
      const baseFunc = (...baseArgs) => baseSpec[key].apply(this, baseArgs);
      const composedFunc = value(baseFunc);
      Debug.do(() => {
        if (!isFunction(composedFunc)) {
          throw new Error(
            `Error overriding ${
              baseSpec.displayName
            }'s extraBindings: ${key} doesn't return a function as expected`
          );
        }
      });
      return composedFunc.apply(this, args);
    };
  }

  return next();
}

export function handleOverrideReceiver(baseSpec, extraSpec, key, next) {
  if (includes(extraSpec[OVERRIDE_RECEIVERS_KEY], key)) {
    const value = extraSpec[key];

    validateOverride(baseSpec, key, value);

    return function newFun(...args) {
      const { type, update: baseUpdate, ...others } = baseSpec[key](args);
      Debug.do(() => {
        if (!isFunction(baseUpdate)) {
          throw new Error(
            `Error overriding ${
              baseSpec.displayName
            }'s extraBindings: ${key} is not a valid reaction in base model`
          );
        }
      });
      return {
        type,
        update: value(baseUpdate),
        ...others
      };
    };
  }

  return next();
}
