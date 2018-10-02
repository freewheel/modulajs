import { merge, map, is } from 'ramda';
import { isImmutableList, isImmutableIterable } from '../../immutable';
import { isModel } from './is_model';
import { getPathFromRoot } from './parent_pointer';

function attrToJS(attr) {
  if (isModel(attr)) {
    return attr.toJS();
  } else if (isImmutableList(attr)) {
    return attr.map(attrToJS).toArray();
  } else if (isImmutableIterable(attr)) {
    return attr.toJS();
  } else if (is(Array, attr) || is(Object, attr)) {
    return map(attrToJS, attr);
  } else {
    return attr;
  }
}

function attrToJSON(attr) {
  if (isModel(attr)) {
    return attr.toJSON();
  } else if (isImmutableList(attr)) {
    return attr.map(attrToJSON).toArray();
  } else if (isImmutableIterable(attr)) {
    return attr.toJSON();
  } else if (is(Array, attr) || is(Object, attr)) {
    return map(attrToJSON, attr);
  } else {
    return attr;
  }
}

export function toJS(model) {
  return map(attrToJS, model.props());
}

// for JSON.stringify
export function toJSON(model) {
  return merge(map(attrToJSON, model.props()), {
    path: getPathFromRoot(model)
  });
}
