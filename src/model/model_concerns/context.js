import { has } from 'lodash';
import { getParentModel, hasParentModel } from './parent_pointer';
import { checkWithValidators } from './proptypes';

function checkContextType(contextTypes, key, value, name) {
  if (process.env.NODE_ENV !== 'production') {
    checkWithValidators(
      contextTypes,
      { [key]: value },
      `model ${name}`,
      'context'
    );
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

  if (
    parentModel.childContextTypes &&
    has(parentModel.childContextTypes, key)
  ) {
    const value = getContextFromParentModel(parentModel, key);

    checkContextType(
      parentModel.childContextTypes,
      key,
      value,
      parentModel.name
    );

    return value;
  } else {
    return getContextFromAncestors(parentModel, key);
  }
}

export function getContext(model, key) {
  if (!has(model.contextTypes, key)) {
    throw new Error(`Unable to find "${key}" from declared context`);
  }

  const value = getContextFromAncestors(model, key, model.contextTypes);

  checkContextType(model.contextTypes, key, value, model.name);

  return value;
}
