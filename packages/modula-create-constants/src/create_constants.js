import { keys, reduce, toUpper, merge } from 'ramda';

export default function createConstants(namespace, constants) {
  return reduce(
    (memo, constantKey) =>
      merge(memo, {
        [constantKey]: toUpper(`${namespace}_${constantKey}`)
      }),
    {},
    keys(constants)
  );
}
