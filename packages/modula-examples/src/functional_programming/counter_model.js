import { Model, withSet, withSetMulti } from 'modula';
import { inc, evolve, dec } from 'ramda';

const ActionTypes = {
  INCREMENT: 'COUNTER_INCREMENT',
  DECREMENT: 'COUNTER_DECREMENT'
};

class CounterModel extends Model {
  static actionTypes = ActionTypes;
  static defaultProps = { value: 0 };

  sendIncrement() {
    this.dispatch(ActionTypes.INCREMENT);
  }

  recvIncrement() {
    return {
      type: ActionTypes.INCREMENT,
      update: withSet('value', inc)
    };
  }

  sendDecrement() {
    this.dispatch(ActionTypes.DECREMENT);
  }

  recvDecrement() {
    return {
      type: ActionTypes.DECREMENT,
      // equivalent to "withSet('value', dec)"
      // use withSetMulti form for demo purpose
      update: withSetMulti(evolve({ value: dec }))
    };
  }
}

export default CounterModel;
