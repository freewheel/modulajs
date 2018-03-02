import { reduce, toUpper } from 'lodash';

export default function createConstants(namespace, constants) {
  return reduce(
    constants,
    (memo, _, constantKey) => {
      memo[constantKey] = toUpper(`${namespace}_${constantKey}`);

      return memo;
    },
    {}
  );
}
