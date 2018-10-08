import { keys, forEach, contains, toPairs } from 'ramda';

export function ensureValidators(
  validators,
  props,
  contextName,
  validatorName,
  propName
) {
  const validatorKeys = keys(validators);
  const propsKeys = keys(props);

  forEach(key => {
    if (!contains(key, propsKeys)) {
      throw new Error(
        `Key "${key}" defined in ${validatorName} but is missing in ${propName} for ${contextName}`
      );
    }
  }, validatorKeys);

  forEach(key => {
    if (!contains(key, validatorKeys)) {
      throw new Error(
        `Key "${key}" defined in ${propName} but is missing in ${validatorName} for ${contextName}`
      );
    }
  }, propsKeys);
}

export function checkValues(validators, props, contextName, typeName) {
  forEach(([key, value]) => {
    const validator = validators[key];

    const error = validator({ [key]: value }, key, contextName, typeName);

    if (error instanceof Error) {
      throw error;
    }
  }, toPairs(props));
}

export function checkKeys(validators, props, contextName, typeName) {
  const validatorKeys = keys(validators);
  const propsKeys = keys(props);

  forEach(key => {
    if (!contains(key, validatorKeys)) {
      throw new Error(
        `Setting property ${key} on ${contextName} which is not defined in ${typeName}`
      );
    }
  }, propsKeys);
}
