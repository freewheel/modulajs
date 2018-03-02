import {
  filter,
  join,
  isArray,
  some,
  isFunction,
  map,
  compact,
  reduce,
  find,
  last,
  flatMap
} from 'lodash';
import { Debug } from '../debug';
import { isModel } from '../model';
import { getReactions } from './get_reactions';

export function getMountModels(oldModels, newModels) {
  return filter(newModels, m => !some(oldModels, om => om.isPeer(m)));
}

export function getUnmountModels(oldModels, newModels) {
  return filter(oldModels, om => !some(newModels, m => om.isPeer(m)));
}

export function getUpdatedModels(oldModels, newModels) {
  return reduce(
    oldModels,
    (memo, om) => {
      const counterpart = find(newModels, m => om.isPeer(m));

      // are peer models but object pointer are different
      if (counterpart && counterpart !== om) {
        return memo.concat([{ oldModel: om, newModel: counterpart }]);
      } else {
        return memo;
      }
    },
    []
  );
}

export function getUpdatedModelsInPath(oldRootModel, newRootModel, path) {
  // given [ 'a', 'b', 'c' ]
  // returns all intermediate paths like
  // [ [], ['a'], ['a', 'b'], ['a', 'b', 'c'] ]
  const intermediatePaths = reduce(
    path,
    (visited, current) => visited.concat([last(visited).concat(current)]),
    [[]]
  );

  return reduce(
    intermediatePaths,
    (memo, p) => {
      const oldModel = oldRootModel.getIn(p);

      if (isModel(oldModel)) {
        return memo.concat({
          oldModel,
          newModel: newRootModel.getIn(p)
        });
      } else {
        return memo;
      }
    },
    []
  );
}

export function minimalChangeSet(om, nm) {
  const oldChildModels = map(om.childModels(), ([m]) => m);
  const newChildModels = map(nm.childModels(), ([m]) => m);

  const mountedModels = getMountModels(oldChildModels, newChildModels);
  const childMountedModels = reduce(
    mountedModels,
    (memo, m) => memo.concat(map(m.childModelsRecursive(), ([mc]) => mc)),
    []
  );

  const unmountedModels = getUnmountModels(oldChildModels, newChildModels);
  const childUnmountedModels = reduce(
    unmountedModels,
    (memo, m) => memo.concat(map(m.childModelsRecursive(), ([mc]) => mc)),
    []
  );

  const updatedModels = getUpdatedModels(oldChildModels, newChildModels);
  const childUpdatedModels = reduce(
    updatedModels,
    (memo, { oldModel, newModel }) => {
      const {
        mountedModels: childMountedModelsInUpdatedModels,
        unmountedModels: childUnmountedModelsInUpdatedModels,
        updatedModels: childUpdatedModelsInUpdatedModels
      } = minimalChangeSet(oldModel, newModel);

      return {
        mountedModels: memo.mountedModels.concat(
          childMountedModelsInUpdatedModels
        ),
        unmountedModels: memo.unmountedModels.concat(
          childUnmountedModelsInUpdatedModels
        ),
        updatedModels: memo.updatedModels.concat(
          childUpdatedModelsInUpdatedModels
        )
      };
    },
    {
      mountedModels: [],
      unmountedModels: [],
      updatedModels: []
    }
  );

  return {
    mountedModels: mountedModels
      .concat(childMountedModels)
      .concat(childUpdatedModels.mountedModels),
    unmountedModels: unmountedModels
      .concat(childUnmountedModels)
      .concat(childUpdatedModels.unmountedModels),
    updatedModels: updatedModels.concat(childUpdatedModels.updatedModels)
  };
}

export function diff(oldRootModel, newRootModel, path) {
  if (oldRootModel === newRootModel) {
    // Won't diff if oldRootModel is not really mutated when:
    // 1. Model props are set with the same old values, or
    // 2. Only local props of the model are set
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
    updatedModels: updatedModels.concat(updatedModelsInPath)
  };
}

export function triggerModelLifecycleEvents(
  mountedModels,
  unmountedModels,
  updatedModels
) {
  return Promise.all(
    compact([
      ...map(
        mountedModels,
        m =>
          m.modelDidMount &&
          new Promise(resolve => {
            resolve(m.modelDidMount());
          })
      ),
      ...map(
        unmountedModels,
        m =>
          m.modelWillUnmount &&
          new Promise(resolve => {
            resolve(m.modelWillUnmount());
          })
      ),
      ...map(
        updatedModels,
        ({ oldModel, newModel }) =>
          newModel.modelDidUpdate &&
          new Promise(resolve => {
            resolve(newModel.modelDidUpdate(oldModel, newModel));
          })
      )
    ])
  );
}

export function triggerServicesLifecycleEvents(
  mountedModels,
  unmountedModels,
  updatedModels
) {
  return Promise.all(
    compact([
      ...flatMap(mountedModels, m =>
        map(
          m.getServices(),
          service =>
            service.modelDidMount &&
            new Promise(resolve => {
              resolve(service.modelDidMount());
            })
        )
      ),
      ...flatMap(unmountedModels, m =>
        map(
          m.getServices(),
          service =>
            service.modelWillUnmount &&
            new Promise(resolve => {
              resolve(service.modelWillUnmount());
            })
        )
      ),
      ...flatMap(updatedModels, ({ oldModel, newModel }) =>
        map(
          newModel.getServices(),
          service =>
            service.modelDidUpdate &&
            new Promise(resolve => {
              resolve(service.modelDidUpdate(oldModel, newModel));
            })
        )
      )
    ])
  );
}

function applyReaction(rootModel, reaction, action) {
  const reactorModel = rootModel.getIn(action.path);

  const reactionResult = reaction.update(reactorModel, action);

  if (!isArray(reactionResult)) {
    throw new Error(
      `Reaction for ${
        action.type
      } did not return an array. Did you mean \`return [ newModel ]\`?`
    );
  }
  const [newReactorModel, ...sideEffects] = reactionResult;

  if (!isModel(newReactorModel)) {
    throw new Error(`Reaction for ${action.type} did not return a new model`);
  }
  if (some(sideEffects, sE => !isFunction(sE))) {
    throw new Error(`Some side effects for ${action.type} are not functions`);
  }

  const newRootModel = rootModel.updateIn(action.path, newReactorModel);

  const { mountedModels, unmountedModels, updatedModels } = diff(
    rootModel,
    newRootModel,
    action.path
  );

  if (action.meta && action.meta.imported) {
    // skip side effects and life cycle events for imported actions
    return [
      newRootModel,
      () =>
        triggerServicesLifecycleEvents(
          mountedModels,
          unmountedModels,
          updatedModels
        )
    ];
  } else {
    return [
      newRootModel,
      ...sideEffects,
      () =>
        triggerModelLifecycleEvents(
          mountedModels,
          unmountedModels,
          updatedModels
        ),
      () =>
        triggerServicesLifecycleEvents(
          mountedModels,
          unmountedModels,
          updatedModels
        )
    ];
  }
}

export function findMatchedReactions(rootModel, action) {
  const reactorModel = rootModel.getIn(action.path);

  if (reactorModel) {
    const reactions = getReactions(reactorModel);

    return filter(reactions, reaction => {
      if (reaction) {
        return reaction.type === action.type;
      } else {
        throw new Error(
          `A receiver in ${
            reactorModel.displayName
          } doesn't return a valid reaction`
        );
      }
    });
  } else {
    return [];
  }
}

export function reactionReducer(model, action) {
  const matchedReactions = findMatchedReactions(model, action);
  const numberOfReactions = matchedReactions.length;

  if (numberOfReactions > 1) {
    Debug.error(
      'found more than one match reactions',
      action,
      matchedReactions
    );

    throw new Error('Unable to handle more than one matched reactions');
  } else if (numberOfReactions === 1) {
    const reactionToApply = matchedReactions[0];

    return applyReaction(model, reactionToApply, action);
  } else {
    Debug.do(() => {
      Debug.warn(
        join(
          [
            'action does not change the state, ',
            'it could be missing the reactions in model, ',
            'or the model structure had changed and was unable to process the action'
          ],
          ' '
        ),
        action
      );
    });

    return [model];
  }
}
