import { forEach } from 'lodash';
import PropTypes from 'prop-types';
import { createStore as createReduxStore } from 'redux';
import { reactionReducer } from '../reaction';
import { Model } from '../model';
import { createConstants } from '../constant';

export function processSideEffects(effects) {
  const [newModel, ...sideEffectFunctions] = effects;

  forEach(sideEffectFunctions, sideEffect => {
    setTimeout(() => {
      sideEffect();
    }, 0);
  });

  return newModel;
}

const ActionTypes = createConstants('ROOT', {
  INIT: null,
  DESTROY: null
});

function createRootModel(DecoratedModel, getDispatch) {
  return new Model({
    displayName: 'RootModel',

    propTypes: {
      decoratedModel: PropTypes.instanceOf(DecoratedModel)
    },

    defaultProps: {
      decoratedModel: null
    },

    childContextTypes: {
      dispatch: PropTypes.func
    },

    extraBindings: {
      getChildContext() {
        return { dispatch: getDispatch() };
      },

      sendInit() {
        getDispatch()({ type: ActionTypes.INIT, path: [] });
      },

      recvInit() {
        return {
          type: ActionTypes.INIT,
          update(model) {
            const newModel = model.set('decoratedModel', new DecoratedModel());

            return [
              newModel,
              () => {
                const decoratedModel = newModel.get('decoratedModel');

                if (!decoratedModel.modelDidMount && decoratedModel.sendInit) {
                  decoratedModel.sendInit();
                }
              }
            ];
          }
        };
      },

      sendDestroy() {
        getDispatch()({ type: ActionTypes.DESTROY, path: [] });
      },

      recvDestroy() {
        return {
          type: ActionTypes.DESTROY,
          update(model) {
            return [model.set('decoratedModel', null)];
          }
        };
      }
    }
  });
}

function createRootReducer(DecoratedModel, getDispatch) {
  return function rootReducer(rootModel = null, action) {
    if (action.type === '@@INIT' || action.type === '@@redux/INIT') {
      return createRootModel(DecoratedModel, getDispatch);
    } else {
      const newModel = processSideEffects(reactionReducer(rootModel, action));
      if (newModel === rootModel) {
        const sourceModel = newModel.getIn(action.path);
        sourceModel &&
          sourceModel.__internalInstance__ &&
          sourceModel.__internalInstance__.notifySubscribers();
      }
      return newModel;
    }
  };
}

export default function createStore(DecoratedModel, enhancer) {
  const store = createReduxStore(
    createRootReducer(DecoratedModel, () => store.dispatch),
    enhancer
  );

  return store;
}
