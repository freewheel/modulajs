# Understanding Store

The *store* has the following responsibilities:

- Holds application state;
- Allows access to state via `getState()`;
- Allows state to be updated via `dispatch(action)`;
- Registers listeners via `subscribe(listener)`.

## API

```
createStore(
  DecoratedModel,
  [storeEnhancer]
)
```

## Basic Usage

```js
import { createStore } from 'modulajs';
import RootModel from './root_model.js';

const store = createStore(RootModel);

function handleStoreChanged() {
  console.log("Store has changed. The new state is:", store.getState());
}

// subscribe to store changing
store.subscribe(handleStoreChanged);
// unsubscribe
store.unsubscribe(handleStoreChanged);

// dispatch an action
store.dispatch({
  type: 'CHANGE_MODEL'
});
```

## Advanced: Use Store Enhancer (and middleware)

The third parameter is a store enhancer. You can use `compose` to merge several enhancers into one.

The following example applies `redux-thunk` and `devToolsExtension` to your store.

```javascript

import { createStore } from 'modulajs';
import { applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk'
import Model from './models';

const store = createStore(
  Model,
  compose(
    applyMiddleware(thunk),
    window.devToolsExtension ? window.devToolsExtension() : f => f
  )
);

```

### Store Enhancer

If an enhancer is provided, the `createStore` function becomes `enhancer(createStore)(DecoratedModel)`. In this way, `enhancer` is able to control everything happening in the store: from creating store to handling actions and updating the state.

### Middleware

Middlewares are restricted enhancers: they can control state updating and action handling but do not have access to store creating. Middlewares are enough for most use cases.

`applyMiddleware` can turn middlewares into an enhancer.

> ModulaJS borrow the ideas of enhancers and middlewares from Redux, and its interface is designed to be compatible with Redux. So it's safe to use most redux middlewares in ModulaJS projects. You can also read [Redux docs: Middlewares](http://redux.js.org/docs/advanced/Middleware.html) to get better understanding of middlewares.
