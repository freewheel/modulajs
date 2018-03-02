# ModulaJS

[![NPM version][npm-image]][npm-url]
[![Apache V2 License][apache-2.0]](LICENSE)

ModulaJS is created to provide an intuitive and simple way of manage complex state. It introduces Model (an immutable tree) to represent the application state tree. Both actions and reactions are handled inside Model, as well as the communications and side effects. It makes the components in view layer very simple, pure and stateless.

ModulaJS works perfectly with [React](https://reactjs.org/), or any other view library, or vanilla JavaScript.

## Influences

ModulaJS is inspired by [Elm](http://elm-lang.org/) and [Redux](http://redux.js.org/), and built upon redux. Most redux middlewares and the redux dev tools should work seamlessly with ModulaJS.

## Installation

```sh
yarn add modulajs
```

Or use NPM

```sh
npm install --save modulajs
```

## Documentation

[Introduction](/docs/modula.md)
* [Store](/docs/store.md)
* [Model](/docs/model.md)
  * [Model Side Effects](/docs/model_side_effects.md)
  * [Model Communications](/docs/model_communications.md)
  * [Model Life Cycle](/docs/model_life_cycle.md)
  * [Model Services](/docs/model_services.md)
* [Constants](/docs/constants.md)
* [APIs](/docs/api/README.md)
  * [Model API](/docs/api/model_api.md)
  * [Constants API](/docs/api/constants_api.md)
  * [Test Util API](/docs/api/test_util_api.md)

## Examples

Taking the [*counter example in redux*](https://github.com/reactjs/redux#the-gist), the following code implements a ModulaJS version.

The whole state is stored in Model tree of the single store, and the ONLY way to mutate a state is dispatching an action in [model sender](/docs/model.md). The receiver, which handles the corresponding reaction, usually appear in pair of the sender, in the same Model class.

```js
// counter_model.js
import { createModel, createConstants } from 'modulajs';
import PropTypes from 'prop-types';

export const ActionTypes = createConstants('COUNTER', {
  INCREMENT: null,
  DECREMENT: null
});

export const CounterModel = createModel({
  displayName: 'CounterModel',

  propTypes: {
    value: PropTypes.number.isRequired
  },

  defaults: {
    value: 0
  },

  sendIncrement() {
    this.dispatch({ type: ActionTypes.INCREMENT });
  },

  recvIncrement() {
    return {
      type: ActionTypes.INCREMENT,
      update(model) {
        const newModel = model.set('value', value => value + 1);

        return [ newModel ];
      }
    };
  },

  sendDecrement() {
    if (this.get('value') > 0) {
      this.dispatch({ type: ActionTypes.DECREMENT });
    }
  },

  recvDecrement() {
    return {
      type: ActionTypes.DECREMENT,
      update(model) {
        const newModel = model.set('value', value => value - 1);

        return [ newModel ];
      }
    };
  }
});

// app.js
import { createStore } from 'modulajs';
import { CounterModel } from './counter_model';

// Create a ModulaJS store to hold state in the decorated model
const store = createStore(CounterModel);

// Subscribe to store changing, then notify the listeners
store.subscribe(() => {
  console.log('Store has changed. The new state is:', store.getState());
});

// Bootstrap the state tree in root model
store.getState().sendInit();

// Dispatch an action with a model instance
// This is the ONLY way to mutate a state in the Store.
const getCounterModel = () => store.getState().get('decoratedModel');

getCounterModel().sendIncrement();
getCounterModel().get('value'); // 1

getCounterModel().sendDecrement();
getCounterModel().get('value'); // 0
```

## Contributing

Please read our [contributing guide](CONTRIBUTING.md) for details on how to contribute to our project.

## License

[Apache-2.0](LICENSE)

[npm-url]: https://www.npmjs.com/package/modulajs
[npm-image]: https://img.shields.io/npm/v/modulajs.svg
[apache-2.0]: http://img.shields.io/badge/license-Apache%20V2-blue.svg