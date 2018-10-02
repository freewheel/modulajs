import { Model } from 'modula';

const ActionTypes = {
  INCREMENT: 'COUNTER_INCREMENT',
  DECREMENT: 'COUNTER_DECREMENT'
};

class CounterModel extends Model {
  sendIncrement() {
    this.dispatch({ type: ActionTypes.INCREMENT });
  }

  recvIncrement() {
    return {
      type: ActionTypes.INCREMENT,
      update(model) {
        const newModel = model.set('value', model.get('value') + 1);

        return [newModel];
      }
    };
  }

  sendDecrement() {
    this.dispatch({ type: ActionTypes.DECREMENT });
  }

  recvDecrement() {
    return {
      type: ActionTypes.DECREMENT,
      update(model) {
        const newModel = model.set('value', model.get('value') - 1);

        return [newModel];
      }
    };
  }
}

CounterModel.actionTypes = ActionTypes;
CounterModel.defaultProps = { value: 0 };

export default CounterModel;
