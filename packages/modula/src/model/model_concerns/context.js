import { has, is } from 'ramda';
import { getParentModel, hasParentModel } from './parent_pointer';

function checkContextType(key, value, name) {
  if (process.env.NODE_ENV !== 'production') {
    if (!is(Function, value)) {
      throw new Error(
        `Invalid context ${key} returned from ${name}, context should return a function`
      );
    }
  }
}

function getContextFromParentModel(parentModel, key) {
  return parentModel.getChildContext()[key];
}

export function getContextFromAncestors(model, key) {
  if (!hasParentModel(model)) {
    throw new Error(
      `Unable to find "${key}" from context.
      Are you calling getContext from defaults?
      If so, the model is not yet attached to the tree and thus has no context.
      To avoid this error, call getContext using the sendInit
      pattern, which is invoked after the model is attached to the tree
      and has context.`
    );
  }

  const parentModel = getParentModel(model);
  const { childContextTypes } = parentModel.constructor;

  if (childContextTypes && has(key, childContextTypes)) {
    const value = getContextFromParentModel(parentModel, key);

    checkContextType(key, value, parentModel.displayName);

    return value;
  } else {
    return getContextFromAncestors(parentModel, key);
  }
}

export function getContext(model, key) {
  const { contextTypes } = model.constructor;

  if (!has(key, contextTypes)) {
    throw new Error(`Unable to find "${key}" from declared context`);
  }

  return getContextFromAncestors(model, key, contextTypes);
}
