import { merge, reduce, is, append } from 'ramda';

// eslint-disable-next-line import/prefer-default-export
export function getAllFunctions(object) {
  let chain = [];

  for (
    let current = Object.getPrototypeOf(object);
    current;
    current = Object.getPrototypeOf(current)
  ) {
    chain = append(current, chain);
  }

  const extractFrom = obj =>
    reduce(
      (memo, key) => {
        if (is(Function, obj[key])) {
          return merge({ [key]: obj[key] }, memo);
        } else {
          return memo;
        }
      },
      {},
      Object.getOwnPropertyNames(obj)
    );

  return reduce((memo, obj) => merge(extractFrom(obj), memo), {}, chain);
}
