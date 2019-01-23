import {
  map,
  all,
  is,
  join,
  filter,
  flatten,
  forEach,
  pipe,
  invoker,
  values,
  converge,
  __,
  assoc,
  useWith,
  unapply,
  reduceRight,
  prop
} from 'ramda';
import debug from 'debug';
import {
  isModel,
  ensureParentPointerOnChildModels,
  setAsLatestInstance,
  setAsPhasingOut
} from '../model';
import { diff } from '../diff';
import { getIntermidiatePaths } from '../path';
import getReactions from './get_reactions';

const reactionDebug = debug('modula:reaction');

const hasLifeCycleMethod = lifeCycleMethodName =>
  pipe(prop(lifeCycleMethodName), is(Function));

const callModelLifeCycleAsPromise = lifeCycleMethodName => m =>
  new Promise(resolve => {
    reactionDebug(`triggering ${lifeCycleMethodName} for model`, m);

    resolve(m[lifeCycleMethodName]());
  });

const mapModelDidMountToPromises = pipe(
  filter(hasLifeCycleMethod('modelDidMount')),
  map(callModelLifeCycleAsPromise('modelDidMount'))
);

const mapModelWillUnmountToPromises = pipe(
  filter(hasLifeCycleMethod('modelWillUnmount')),
  map(callModelLifeCycleAsPromise('modelWillUnmount'))
);

const mapModelDidUpdateToPromises = pipe(
  filter(pipe(prop('newModel'), hasLifeCycleMethod('modelDidUpdate'))),
  map(
    ({ oldModel, newModel }) =>
      new Promise(resolve => {
        reactionDebug(
          'triggering modelDidUpdate for model',
          oldModel,
          newModel
        );

        resolve(newModel.modelDidUpdate(oldModel, newModel));
      })
  )
);

// given 3 mapping function
// apply 3 arguments to 3 functions respectively
// and run all returned promises with Promise.all
const runInParallelWith = unapply(
  useWith(pipe(unapply(flatten), promises => Promise.all(promises)))
);

export const triggerModelLifecycleEvents = runInParallelWith(
  mapModelDidMountToPromises,
  mapModelWillUnmountToPromises,
  mapModelDidUpdateToPromises
);

const callServiceLifeCycleAsPromise = lifeCycleMethodName => s =>
  new Promise(resolve => {
    reactionDebug(`triggering ${lifeCycleMethodName} for service`, s);

    resolve(s[lifeCycleMethodName]());
  });

// return model services which has specified lifecycle
const getServicesWithLifeCycle = lifeCycleMethodName =>
  pipe(
    invoker(0, 'getServices'),
    values,
    filter(hasLifeCycleMethod(lifeCycleMethodName))
  );

const mapServiceModelDidMountToPromises = pipe(
  map(getServicesWithLifeCycle('modelDidMount')),
  flatten,
  map(callServiceLifeCycleAsPromise('modelDidMount'))
);

const mapServiceModelWillUnmountToPromises = pipe(
  map(getServicesWithLifeCycle('modelWillUnmount')),
  flatten,
  map(callServiceLifeCycleAsPromise('modelWillUnmount'))
);

const mapServiceModelDidUpdateToPromises = pipe(
  map(
    converge(map, [
      um => assoc('service', __, um),
      pipe(prop('newModel'), getServicesWithLifeCycle('modelDidUpdate'))
    ])
  ),
  flatten,
  map(
    ({ oldModel, newModel, service }) =>
      new Promise(resolve => {
        reactionDebug(
          'triggering service modelDidUpdate for model',
          oldModel,
          newModel,
          service
        );

        resolve(service.modelDidUpdate(oldModel, newModel));
      })
  )
);

export const triggerServicesLifecycleEvents = runInParallelWith(
  mapServiceModelDidMountToPromises,
  mapServiceModelWillUnmountToPromises,
  mapServiceModelDidUpdateToPromises
);

function houseKeeping(mountedModels, unmountedModels, updatedModels) {
  forEach(m => {
    ensureParentPointerOnChildModels(m, true);
  }, mountedModels);

  forEach(m => {
    setAsPhasingOut(m);
  }, unmountedModels);

  forEach(({ newModel }) => {
    ensureParentPointerOnChildModels(newModel, true);
    setAsLatestInstance(newModel);
  }, updatedModels);
}

export function atomUpdate(oldRootModel, path, newReactorModel) {
  return reduceRight(
    (p, memo) => {
      const current = memo.getIn(p);

      if (isModel(current) && current.modelWillUpdate) {
        return memo.updateIn(p, current.modelWillUpdate(oldRootModel.getIn(p)));
      } else {
        return memo;
      }
    },
    oldRootModel.updateIn(path, newReactorModel),
    getIntermidiatePaths(path)
  );
}

function applyReaction(rootModel, reaction, action) {
  reactionDebug('apply reaction', rootModel, reaction, action);

  const reactorModel = rootModel.getIn(action.path);

  const reactionResult = reaction.update(reactorModel, action);

  if (!is(Array, reactionResult)) {
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

  if (!all(is(Function), sideEffects)) {
    throw new Error(`Some side effects for ${action.type} are not functions`);
  }

  // updateIn and modelWillUpdate in one transaction
  const newRootModel = atomUpdate(rootModel, action.path, newReactorModel);

  const { mountedModels, unmountedModels, updatedModels } = diff(
    rootModel,
    newRootModel,
    action.path
  );

  // trigger some side effects which is required for house keeping
  // such as set latest instance
  // and setup parent pointers etc
  houseKeeping(mountedModels, unmountedModels, updatedModels);

  if (action.meta && action.meta.imported) {
    reactionDebug(
      'found imported actions from DevTools',
      'skip side effects and life cycle events for imported actions'
    );

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

    return filter(reaction => {
      if (reaction) {
        return reaction.type === action.type;
      } else {
        throw new Error(
          `A receiver in ${
            reactorModel.displayName
          } doesn't return a valid reaction`
        );
      }
    }, reactions);
  } else {
    return [];
  }
}

export function reactionReducer(model, action) {
  const matchedReactions = findMatchedReactions(model, action);
  const numberOfReactions = matchedReactions.length;

  if (numberOfReactions > 1) {
    reactionDebug(
      'found more than one match reactions',
      action,
      matchedReactions
    );

    throw new Error('Unable to handle more than one matched reactions');
  } else if (numberOfReactions === 1) {
    const reactionToApply = matchedReactions[0];

    return applyReaction(model, reactionToApply, action);
  } else {
    reactionDebug(
      join(' ', [
        'action does not change the state, ',
        'it could be missing the reactions in model, ',
        'or the model structure had changed and was unable to process the action'
      ]),
      action
    );

    return [model];
  }
}
