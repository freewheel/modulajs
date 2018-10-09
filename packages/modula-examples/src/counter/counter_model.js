import { Model } from 'modula';

const ActionTypes = {
  INCREMENT: 'COUNTER_INCREMENT',
  DECREMENT: 'COUNTER_DECREMENT'
};

class CounterModel extends Model {
  static actionTypes = ActionTypes;
  // default props defines the shape of the state
  // which is represented by the model
  static defaultProps = { value: 0 };

  sendIncrement() {
    this.dispatch({ type: ActionTypes.INCREMENT });
  }

  recvIncrement() {
    // a recv function respond to an action which is created in a send function
    // their "type" has to be matched
    return {
      type: ActionTypes.INCREMENT,
      update(model) {
        // model are immutable
        // use set to update a model
        // which returns a new model instance
        // and you're guranteed that the pointer newModel !== model
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

export default CounterModel;
