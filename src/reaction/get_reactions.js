import { filter, keys, map, startsWith } from 'lodash';

export function getReactions(model) {
  const recvMethodNames = filter(keys(model), key => startsWith(key, 'recv'));

  return map(recvMethodNames, recvMethod => model[recvMethod]());
}
