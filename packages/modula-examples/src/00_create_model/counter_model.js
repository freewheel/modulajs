import createModel from 'modula-create-model';
import createConstants from 'modula-create-constants';

const ActionTypes = createConstants('COUNTER', {
  INCREMENT: 'INCREMENT',
  DECREMENT: 'DECREMENT'
});

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

export default CounterModel;
