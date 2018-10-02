import {
  is,
  reduce,
  toPairs,
  addIndex,
  map,
  pipe,
  invoker,
  concat,
  append
} from 'ramda';
import { isImmutableType } from '../../immutable';
import { isModel } from './is_model';

const extractReducer = (path, recursive) => (memo, [key, attr]) =>
  // eslint-disable-next-line no-use-before-define
  concat(memo, extract(attr, append(key, path), recursive));

function extract(attribute, path, recursive) {
  if (isModel(attribute)) {
    const model = attribute;

    if (recursive) {
      return reduce(
        extractReducer(path, recursive),
        [[model, path]],
        toPairs(model.props())
      );
    } else {
      return [[model, path]];
    }
  } else if (isImmutableType(attribute)) {
    return attribute.reduce(
      (memo, childAttribute, key) =>
        extractReducer(path, recursive)(memo, [key, childAttribute]),
      []
    );
  } else if (is(Array, attribute)) {
    return reduce(
      extractReducer(path, recursive),
      [],
      addIndex(map)((i, idx) => [idx, i], attribute)
    );
  } else if (is(Object, attribute)) {
    return reduce(extractReducer(path, recursive), [], toPairs(attribute));
  } else {
    return [];
  }
}

export const extractChildModels = pipe(
  invoker(0, 'props'),
  toPairs,
  reduce(extractReducer([], false), [])
);

export const extractChildModelsRecursively = pipe(
  invoker(0, 'props'),
  toPairs,
  reduce(extractReducer([], true), [])
);
