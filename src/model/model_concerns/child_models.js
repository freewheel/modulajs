import { reduce } from 'lodash';
import { List, Map } from 'immutable';
import { isModel } from './is_model';

function isIterable(attr) {
  return List.isList(attr) || Map.isMap(attr);
}

function extract(attribute, path, recursive) {
  if (isModel(attribute)) {
    const model = attribute;

    if (recursive) {
      return [[model, path]].concat(
        reduce(
          model.attributes(),
          (memo, modelAttribute, key) =>
            memo.concat(extract(modelAttribute, path.concat([key]), recursive)),
          []
        )
      );
    } else {
      return [[model, path]];
    }
  } else if (isIterable(attribute)) {
    const iterable = attribute;

    return iterable.reduce(
      (memo, childAttribute, key) =>
        memo.concat(extract(childAttribute, path.concat([key]), recursive)),
      []
    );
  } else {
    return [];
  }
}

export function extractChildModels(model) {
  return reduce(
    model.attributes(),
    (memo, attribute, key) => memo.concat(extract(attribute, [key], false)),
    []
  );
}

export function extractChildModelsRecursively(model) {
  return reduce(
    model.attributes(),
    (memo, attribute, key) => memo.concat(extract(attribute, [key], true)),
    []
  );
}
