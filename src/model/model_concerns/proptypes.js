import { keys, forEach, includes } from 'lodash';

export function ensureValidators(
  validators,
  props,
  contextName,
  validatorName,
  propName
) {
  const validatorKeys = keys(validators);
  const propsKeys = keys(props);

  forEach(validatorKeys, key => {
    if (!includes(propsKeys, key)) {
      throw new Error(
        `Key "${key}" defined in ${validatorName} but is missing in ${propName} for ${contextName}`
      );
    }
  });

  forEach(propsKeys, key => {
    if (!includes(validatorKeys, key)) {
      throw new Error(
        `Key "${key}" defined in ${propName} but is missing in ${validatorName} for ${contextName}`
      );
    }
  });
}

// TODO: To fail fast, we are throwing the type validation errors instead of just printing them in console.
// This is a tricky workaround to run the validators directly in `prop-types`
// See https://github.com/facebook/prop-types#difference-from-reactproptypes-dont-call-validator-functions

// Copied the mock secret from https://github.com/facebook/prop-types/blob/master/lib/ReactPropTypesSecret.js
const ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';

export function checkWithValidators(validators, props, contextName, typeName) {
  forEach(props, (value, key) => {
    const validator = validators[key];

    const error = validator(
      { [key]: value },
      key,
      contextName,
      typeName,
      null,
      ReactPropTypesSecret
    );

    if (error instanceof Error) {
      throw error;
    }
  });
}
