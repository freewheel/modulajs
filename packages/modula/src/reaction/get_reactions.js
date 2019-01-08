import { filter, keys, map, startsWith } from 'ramda';
import { getAllFunctions } from '../model/model_concerns/inheritance';

export default function getReactions(model) {
  const recvMethodNames = filter(
    startsWith('recv'),
    keys(getAllFunctions(model))
  );

  return map(recvMethod => model[recvMethod](), recvMethodNames);
}
