import { forEach } from 'ramda';
import { createStore as createReduxStore } from 'redux';
import debug from 'debug';
import { reactionReducer } from '../reaction';
import { Model } from '../model';

const storeDebug = debug('modula:store');

export function processSideEffects(effects) {
  storeDebug('process side effects', effects);

  const [newModel, ...sideEffectFunctions] = effects;

  forEach(sideEffect => {
    setTimeout(() => {
      sideEffect();
    }, 0);
  }, sideEffectFunctions);

  return newModel;
}

const createRootModel = function createRootModel(DecoratedModel, getDispatch) {
  const ActionTypes = {
    INIT: 'ROOT_INIT',
    DESTROY: 'ROOT_DESTROY'
  };

  class RootModel extends Model {
    getChildContext() {
      return { dispatch: getDispatch() };
    }

    sendInit() {
      storeDebug('root model send init');

      getDispatch()({ type: ActionTypes.INIT, path: [] });
    }

    recvInit() {
      return {
        type: ActionTypes.INIT,
        update(model) {
          const newModel = model.set('decoratedModel', new DecoratedModel());

          return [newModel];
        }
      };
    }

    sendDestroy() {
      storeDebug('root model send destroy');

      getDispatch()({ type: ActionTypes.DESTROY, path: [] });
    }

    recvDestroy() {
      return {
        type: ActionTypes.DESTROY,
        update(model) {
          return [model.set('decoratedModel', null)];
        }
      };
    }
  }

  RootModel.actionTypes = ActionTypes;

  RootModel.defaultProps = {
    decoratedModel: null
  };

  RootModel.childContextTypes = {
    dispatch: `
      Dispatch action for store to handle.
      First argument is the action object.
      Returns null.
    `
  };

  return new RootModel();
};

const createRootReducer = function createRootReducer(
  DecoratedModel,
  getDispatch
) {
  return function rootReducer(rootModel = null, action) {
    storeDebug('root reducer called with model', rootModel, 'action', action);

    if (action.type === '@@INIT' || action.type === '@@redux/INIT') {
      return createRootModel(DecoratedModel, getDispatch);
    } else {
      return processSideEffects(reactionReducer(rootModel, action));
    }
  };
};

export default function createStore(DecoratedModel, enhancer) {
  const store = createReduxStore(
    createRootReducer(DecoratedModel, () => store.dispatch),
    enhancer
  );

  return store;
}
