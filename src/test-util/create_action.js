import { getPathFromRoot } from '../model/model_concerns/parent_pointer';

export function createAction(model, action) {
  return {
    ...action,
    path: getPathFromRoot(model)
  };
}
