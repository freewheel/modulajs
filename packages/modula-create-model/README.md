# modula-create-model

Define modula model by passing model spec.

## Installation

```
npm install @modulajs/modula-create-model
```

## Usage

```
import createModel from '@modulajs/modula-create-model';

const ActionTypes = {
  INCREMENT: 'COUNTER_INCREMENT',
  DECREMENT: 'COUNTER_DECREMENT'
};

const CounterModel = createModel({
  actionTypes: ActionTypes,

  defaults: { value: 0 },

  sendIncrement() {
    this.dispatch({ type: ActionTypes.INCREMENT });
  },

  recvIncrement() {
    return {
      type: ActionTypes.INCREMENT,
      update(model) {
        const newModel = model.set('value', model.get('value') + 1);

        return [newModel];
      }
    };
  },

  sendDecrement() {
    this.dispatch({ type: ActionTypes.DECREMENT });
  },

  recvDecrement() {
    return {
      type: ActionTypes.DECREMENT,
      update(model) {
        const newModel = model.set('value', model.get('value') - 1);

        return [newModel];
      }
    };
  }
});
```
