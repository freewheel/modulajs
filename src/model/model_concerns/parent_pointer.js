import { forEach } from 'lodash';
import { extractChildModels } from './child_models';

export function setParent(model, parent, path) {
  model.__parent__ = parent;
  model.__path_from_parent__ = path;
}

export function ensureParentPointerOnChildModels(model) {
  const childModels = extractChildModels(model);

  forEach(childModels, child => {
    setParent(child[0], model, child[1]);
  });
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

export function getParentModel(model) {
  return model.__parent__;
}

export function hasParentModel(model) {
  return model.__parent__ !== undefined;
}
