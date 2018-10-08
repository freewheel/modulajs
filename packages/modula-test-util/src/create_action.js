import { getPathFromRoot } from 'modula';

export default function createAction(model, action) {
  return {
    ...action,
    path: getPathFromRoot(model)
  };
}
