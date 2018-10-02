/* eslint-disable no-use-before-define */
import {
  is,
  isNil,
  append,
  toPairs,
  forEach,
  anyPass,
  addIndex,
  has,
  concat,
  keys
} from 'ramda';
import { isModel } from 'modula';
import { isImmutableType } from 'modula/dist/immutable';

const isPrimitiveType = anyPass([is(Number), is(Boolean), is(String), isNil]);

const bothTrue = testType => (value, newValue) =>
  testType(value) && testType(newValue);

const bothPrimitiveTypes = bothTrue(isPrimitiveType);
const oneSideNil = (value, newValue) =>
  (isNil(value) && !isNil(newValue)) || (!isNil(value) && isNil(newValue));
const bothModels = bothTrue(isModel);
const bothImmutables = bothTrue(isImmutableType);
const bothArrays = bothTrue(is(Array));

function pathDiffForModel(contextPath, oldModel, newModel) {
  const oldProps = oldModel.props();
  const newProps = newModel.props();

  return pathDiffForObject(contextPath, oldProps, newProps);
}

function pathDiffForImmutable(contextPath, oldIterable, newIterable) {
  let updatedPaths = [];
  let deletedPaths = [];
  let createdPaths = [];

  oldIterable.forEach((value, key) => {
    if (newIterable.has(key)) {
      const newValue = newIterable.get(key);

      if (value !== newValue) {
        const {
          updatedPaths: childUpdatedPaths,
          deletedPaths: childDeletedPaths,
          createdPaths: childCreatedPaths
        } = pathDiff(append(key, contextPath), value, newValue);

        updatedPaths = concat(updatedPaths, childUpdatedPaths);
        deletedPaths = concat(deletedPaths, childDeletedPaths);
        createdPaths = concat(createdPaths, childCreatedPaths);
      }
    } else {
      deletedPaths.push(append(key, contextPath));
    }
  });

  newIterable.forEach((value, key) => {
    if (!oldIterable.has(key)) {
      createdPaths.push(append(key, contextPath));
    }
  });

  return { updatedPaths, deletedPaths, createdPaths };
}

function pathDiffForArray(contextPath, oldArray, newArray) {
  let updatedPaths = [];
  let deletedPaths = [];
  let createdPaths = [];

  addIndex(forEach)((value, idx) => {
    if (newArray[idx] !== undefined) {
      const newValue = newArray[idx];

      if (value !== newValue) {
        const {
          updatedPaths: childUpdatedPaths,
          deletedPaths: childDeletedPaths,
          createdPaths: childCreatedPaths
        } = pathDiff(append(idx, contextPath), value, newValue);

        updatedPaths = concat(updatedPaths, childUpdatedPaths);
        deletedPaths = concat(deletedPaths, childDeletedPaths);
        createdPaths = concat(createdPaths, childCreatedPaths);
      }
    } else {
      deletedPaths.push(append(idx, contextPath));
    }
  }, oldArray);

  addIndex(forEach)((value, idx) => {
    if (oldArray[idx] === undefined) {
      createdPaths.push(append(idx, contextPath));
    }
  }, newArray);

  return { updatedPaths, deletedPaths, createdPaths };
}

function pathDiffForObject(contextPath, oldObject, newObject) {
  let updatedPaths = [];
  let deletedPaths = [];
  let createdPaths = [];

  forEach(([key, value]) => {
    if (has(key, newObject)) {
      const newValue = newObject[key];

      if (value !== newValue) {
        const {
          updatedPaths: childUpdatedPaths,
          deletedPaths: childDeletedPaths,
          createdPaths: childCreatedPaths
        } = pathDiff(append(key, contextPath), value, newValue);

        updatedPaths = concat(updatedPaths, childUpdatedPaths);
        deletedPaths = concat(deletedPaths, childDeletedPaths);
        createdPaths = concat(createdPaths, childCreatedPaths);
      }
    } else {
      deletedPaths.push(append(key, contextPath));
    }
  }, toPairs(oldObject));

  forEach(key => {
    if (!has(key, oldObject)) {
      createdPaths.push(append(key, contextPath));
    }
  }, keys(newObject));

  return { updatedPaths, deletedPaths, createdPaths };
}

// paths will be returned in depth first manner
export default function pathDiff(contextPath, oldThing, newThing) {
  if (
    (bothPrimitiveTypes(oldThing, newThing) && oldThing !== newThing) ||
    oneSideNil(oldThing, newThing)
  ) {
    return {
      updatedPaths: [contextPath],
      deletedPaths: [],
      createdPaths: []
    };
  } else if (bothModels(oldThing, newThing)) {
    return pathDiffForModel(contextPath, oldThing, newThing);
  } else if (bothImmutables(oldThing, newThing)) {
    return pathDiffForImmutable(contextPath, oldThing, newThing);
  } else if (bothArrays(oldThing, newThing)) {
    return pathDiffForArray(contextPath, oldThing, newThing);
  } else {
    return pathDiffForObject(contextPath, oldThing, newThing);
  }
}
