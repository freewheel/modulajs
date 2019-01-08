// Usage:
//
// hotZone(c)
//
// hotZone(c, {
//   modelA: modelA,
//   modelB: modelB
// })
//
// hotZone(c, {
//   name: {
//     from: model,
//     watch: ['name']
//   },
//   value: {
//     from: model,
//     watch: ['value']
//   }
// })
//
import React, { Component } from 'react';
import {
  map,
  forEach,
  values,
  uniq,
  identity,
  is,
  isNil,
  times,
  keys,
  concat,
  merge,
  pipe,
  reduce,
  flip,
  append,
  fromPairs,
  toPairs,
  not,
  isEmpty,
  allPass,
  anyPass,
  all,
  equals
} from 'ramda';
import debug from 'debug';
import { getPathFromRoot, isModel } from 'modula';
import { isImmutableType } from 'modula/dist/immutable';
import HotZoneContext from './hot_zone_context';
import { wrapDisplayName } from './display_name';

const hotZoneDebug = debug('modula-react:hotzone');

const flipAppend = flip(append);

function keysOfSubject(subject) {
  if (isModel(subject)) {
    return keys(subject.props());
  } else if (isImmutableType(subject)) {
    return subject.keySeq().toJS();
  } else if (is(Array, subject)) {
    return times(identity, subject.length);
  } else {
    // Object
    return keys(subject);
  }
}

const spreadOne = (model, nextPath) => subjectPath => {
  const subject = model.getIn(subjectPath);

  if (nextPath === '*') {
    return map(flipAppend(subjectPath), keysOfSubject(subject));
  } else if (is(Array, nextPath)) {
    return map(flipAppend(subjectPath), nextPath);
  } else {
    return [flipAppend(subjectPath, nextPath)];
  }
};

const mergeResults = calculate => (result, nextArg) =>
  concat(result, calculate(nextArg));

const handleNextPath = from => (currentWatchPaths, nextPath) =>
  reduce(mergeResults(spreadOne(from, nextPath)), [], currentWatchPaths);

// spread array and '*' in watch path
// given ['counters', [0, 1]]
// returns [['counters', 0], ['counters', 1]]
export function spreadWatchPath({ from, watch }) {
  const fromPath = getPathFromRoot(from);

  const paths = reduce(handleNextPath(from), [[]], watch);

  return map(concat(fromPath), paths);
}

const getWatchPaths = pipe(
  values,
  map(spreadWatchPath),
  reduce(concat, []),
  uniq
);

const getNewValue = getStateInPath => ({ from, get }) => {
  const fromPath = getPathFromRoot(from);
  const newModel = getStateInPath(fromPath);

  return get(newModel);
};

const isNotEmpty = item => not(isEmpty(item));

const isArrayOfStrings = allPass([is(Array), isNotEmpty, all(is(String))]);

const isValidPathItem = anyPass([
  isArrayOfStrings,
  is(String),
  is(Number),
  equals('*')
]);

export const isValidWatchPath = all(isValidPathItem);

export function standardizeAttrOption(name, option) {
  if (isModel(option)) {
    return {
      from: option,
      watch: [],
      get: identity
    };
  } else if (isNil(option) || is(Array, option)) {
    throw new Error(
      `option is neither modula model or an object for hotZone attr "${name}"`
    );
  } else if (!isModel(option.from)) {
    throw new Error(
      `"from" in the option is not a modula model for hotZone attr "${name}"`
    );
  } else if (option.watch && !isValidWatchPath(option.watch)) {
    throw new Error(
      `"watch" in the option is not one of array,  for hotZone attr "${name}"`
    );
  } else {
    const finalWatch = option.watch || [];

    return merge(
      {
        get: m => m.getIn(finalWatch),
        watch: []
      },
      option
    );
  }
}

export default function hotZone(DecoratedComponent, attrs = undefined) {
  return props => (
    <HotZoneContext.Consumer>
      {({ registerZone, unregisterZone, getStateInPath }) => {
        function finalAttrs() {
          if (attrs === undefined) {
            // default from extract path from model
            return {
              model: {
                from: props.model,
                watch: [],
                get: identity
              }
            };
          } else {
            return fromPairs(
              map(
                ([name, option]) => [name, standardizeAttrOption(name, option)],
                toPairs(attrs)
              )
            );
          }
        }

        class Wrapper extends Component {
          componentWillMount() {
            hotZoneDebug('watch paths', getWatchPaths(finalAttrs()));

            forEach(propPath => {
              registerZone(propPath, this);
            }, getWatchPaths(finalAttrs()));
          }

          componentWillReceiveProps() {
            // TODO handle parent refresh
          }

          componentWillUnmount() {
            forEach(propPath => {
              unregisterZone(propPath, this);
            }, getWatchPaths(finalAttrs()));
          }

          render() {
            const finalProps = merge(
              props,
              map(getNewValue(getStateInPath), finalAttrs())
            );

            hotZoneDebug('rendering with props', finalProps);

            return <DecoratedComponent {...finalProps} />;
          }
        }

        Wrapper.displayName = wrapDisplayName(DecoratedComponent, 'hotZone');

        return <Wrapper />;
      }}
    </HotZoneContext.Consumer>
  );
}
