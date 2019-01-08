import { forEach } from 'ramda';
import { extractChildModels } from './child_models';

export function getParentModel(model) {
  return model.__parent__;
}

export function hasParentModel(model) {
  return model.__parent__ !== undefined;
}

export function setParent(model, parent, path) {
  model.__parent__ = parent;
  model.__path_from_parent__ = path;
}

export function ensureParentPointerOnChildModels(parentModel, force = false) {
  const childModels = extractChildModels(parentModel);

  forEach(child => {
    const [model, path] = child;

    if (force || !hasParentModel(model)) {
      setParent(model, parentModel, path);
    }
  }, childModels);
}

export function getPathFromRoot(model) {
  let path = [];
  let current = model;

  while (current.__parent__) {
    path = current.__path_from_parent__.concat(path);
    current = current.__parent__;
  }

  return path;
}
