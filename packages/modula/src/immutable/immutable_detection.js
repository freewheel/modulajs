import { anyPass } from 'ramda';

// copied from immutable project
const IS_LIST_SENTINEL = '@@__IMMUTABLE_LIST__@@';

export function isImmutableList(maybeList) {
  return !!(maybeList && maybeList[IS_LIST_SENTINEL]);
}

const IS_MAP_SENTINEL = '@@__IMMUTABLE_MAP__@@';

export function isImmutableMap(maybeMap) {
  return !!(maybeMap && maybeMap[IS_MAP_SENTINEL]);
}

export const IS_ITERABLE_SENTINEL = '@@__IMMUTABLE_ITERABLE__@@';

export function isImmutableIterable(maybeCollection) {
  return !!(maybeCollection && maybeCollection[IS_ITERABLE_SENTINEL]);
}

export const isImmutableType = anyPass([
  isImmutableList,
  isImmutableMap,
  isImmutableIterable
]);
