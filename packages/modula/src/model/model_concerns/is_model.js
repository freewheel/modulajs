const IS_MODEL_SENTINEL = '@@__FW_MODULA_MODEL__@@';

export function isModel(maybeModel) {
  return !!(maybeModel && maybeModel[IS_MODEL_SENTINEL]);
}

export function markModel(model) {
  model[IS_MODEL_SENTINEL] = true;
}
