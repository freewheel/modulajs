import { reduce } from 'lodash';
import { List, Iterable } from 'immutable';
import { isModel } from './is_model';
import { getPathFromRoot } from './parent_pointer';

function attrToJS(attr) {
  if (isModel(attr)) {
    return attr.toJS();
  } else if (List.isList(attr)) {
    return attr.map(attrToJS).toArray();
  } else if (Iterable.isIterable(attr)) {
    return attr.toJS();
  } else {
    return attr;
  }
}

function attrToJSON(attr) {
  if (isModel(attr)) {
    return attr.toJSON();
  } else if (List.isList(attr)) {
    return attr.map(attrToJSON).toArray();
  } else if (Iterable.isIterable(attr)) {
    return attr.toJSON();
  } else {
    return attr;
  }
}

export function toJS(model) {
  return reduce(
    model.attributes(),
    (memo, attr, key) => {
      memo[key] = attrToJS(attr);

      return memo;
    },
    {}
  );
}

// for JSON.stringify
export function toJSON(model) {
  return {
    ...reduce(
      model.attributes(),
      (memo, attr, key) => {
        memo[key] = attrToJSON(attr);

        return memo;
      },
      {}
    ),
    path: getPathFromRoot(model)
  };
}
