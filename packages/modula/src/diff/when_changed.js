import { isNil, equals } from 'ramda';

export function whenMounted(oldModel, newModel, watchPath, callback) {
  const oldThing = oldModel.getIn(watchPath);
  const newThing = newModel.getIn(watchPath);

  if (isNil(oldThing) && !isNil(newThing)) {
    callback(newThing);
  }
}

export function whenUnmounted(oldModel, newModel, watchPath, callback) {
  const oldThing = oldModel.getIn(watchPath);
  const newThing = newModel.getIn(watchPath);

  if (!isNil(oldThing) && isNil(newThing)) {
    callback(oldThing);
  }
}

export function whenUpdated(oldModel, newModel, watchPath, callback) {
  const oldThing = oldModel.getIn(watchPath);
  const newThing = newModel.getIn(watchPath);

  if (!isNil(oldThing) && !isNil(newThing) && !equals(oldThing, newThing)) {
    callback(oldThing, newThing);
  }
}
