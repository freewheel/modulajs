import { reduce, append, last } from 'ramda';

// given [ 'a', 'b', 'c' ]
// returns all intermediate paths like
// [ [], ['a'], ['a', 'b'], ['a', 'b', 'c'] ]
export function getIntermidiatePaths(path) {
  return reduce(
    (visited, current) => append(append(current, last(visited)), visited),
    [[]],
    path
  );
}
