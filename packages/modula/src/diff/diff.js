import {
  head,
  map,
  find,
  reject,
  any,
  reduce,
  concat,
  append,
  flatten,
  bind
} from 'ramda';
import { isModel } from '../model';
import { getIntermidiatePaths } from '../path';

const containsPeer = list => m => any(bind(m.isPeer, m))(list);

export function getMountModels(oldModels, newModels) {
  return reject(containsPeer(oldModels), newModels);
}

export function getUnmountModels(oldModels, newModels) {
  return reject(containsPeer(newModels), oldModels);
}

export function getUpdatedModels(oldModels, newModels) {
  return reduce(
    (memo, om) => {
      const counterpart = find(bind(om.isPeer, om), newModels);

      // are peer models but object pointer are different
      if (counterpart && counterpart !== om) {
        return append({ oldModel: om, newModel: counterpart }, memo);
      } else {
        return memo;
      }
    },
    [],
    oldModels
  );
}

export function getUpdatedModelsInPath(oldRootModel, newRootModel, path) {
  const intermediatePaths = getIntermidiatePaths(path);

  return reduce(
    (memo, p) => {
      const oldModel = oldRootModel.getIn(p);

      if (isModel(oldModel)) {
        return append(
          {
            oldModel,
            newModel: newRootModel.getIn(p)
          },
          memo
        );
      } else {
        return memo;
      }
    },
    [],
    intermediatePaths
  );
}

const getModelChildren = m => map(head, m.childModels());
const getModelDescendants = m => map(head, m.childModelsRecursive());

export function minimalChangeSet(om, nm) {
  const oldChildModels = getModelChildren(om);
  const newChildModels = getModelChildren(nm);

  const mountedModels = getMountModels(oldChildModels, newChildModels);
  const childMountedModels = flatten(map(getModelDescendants, mountedModels));

  const unmountedModels = getUnmountModels(oldChildModels, newChildModels);
  const childUnmountedModels = flatten(
    map(getModelDescendants, unmountedModels)
  );

  const updatedModels = getUpdatedModels(oldChildModels, newChildModels);
  const childUpdatedModels = reduce(
    (memo, { oldModel, newModel }) => {
      const {
        mountedModels: childMountedModelsInUpdatedModels,
        unmountedModels: childUnmountedModelsInUpdatedModels,
        updatedModels: childUpdatedModelsInUpdatedModels
      } = minimalChangeSet(oldModel, newModel);

      return {
        mountedModels: concat(
          childMountedModelsInUpdatedModels,
          memo.mountedModels
        ),
        unmountedModels: concat(
          childUnmountedModelsInUpdatedModels,
          memo.unmountedModels
        ),
        updatedModels: concat(
          childUpdatedModelsInUpdatedModels,
          memo.updatedModels
        )
      };
    },
    {
      mountedModels: [],
      unmountedModels: [],
      updatedModels: []
    },
    updatedModels
  );

  return {
    mountedModels: concat(
      concat(childUpdatedModels.mountedModels, childMountedModels),
      mountedModels
    ),
    unmountedModels: concat(
      concat(childUpdatedModels.unmountedModels, childUnmountedModels),
      unmountedModels
    ),
    updatedModels: concat(childUpdatedModels.updatedModels, updatedModels)
  };
}

export function diff(oldRootModel, newRootModel, path) {
  if (oldRootModel === newRootModel) {
    return {
      mountedModels: [],
      unmountedModels: [],
      updatedModels: []
    };
  }

  const oldReactorModel = oldRootModel.getIn(path);
  const newReactorModel = newRootModel.getIn(path);

  const { mountedModels, unmountedModels, updatedModels } = minimalChangeSet(
    oldReactorModel,
    newReactorModel
  );

  const updatedModelsInPath = getUpdatedModelsInPath(
    oldRootModel,
    newRootModel,
    path
  );

  return {
    mountedModels,
    unmountedModels,
    updatedModels: concat(updatedModelsInPath, updatedModels)
  };
}
