import { Model } from 'modula';
import { map, append, inc, sum } from 'ramda';

// reuse model from previous Counter example
import CounterModel from '../counter/counter_model';

const ActionTypes = {
  COUNTER_ADD: 'COUNTER_LIST_COUNTER_ADD'
};

class CounterListModel extends Model {
  static actionTypes = ActionTypes;
  static defaultProps = {
    globalId: 0,
    // properties in defaults can be functions so they are only executed when the Model is initialized
    // it is useful when you need to do heavier computation like initialize another Model
    counters: () => [new CounterModel()]
  };

  sendCounterAdd() {
    this.dispatch({ type: ActionTypes.COUNTER_ADD });
  }

  recvCounterAdd() {
    return {
      type: ActionTypes.COUNTER_ADD,
      update(model) {
        // setMulti can update multiple attributes at once
        const newModel = model.setMulti({
          counters: append(
            new CounterModel({ name: `Counter${model.get('globalId') + 1}` })
          ),
          // the value can also be a function
          // which accepts the current value and returns a new value to be set
          globalId: inc
        });

        return [newModel];
      }
    };
  }

  getSum() {
    return sum(map(c => c.get('value'), this.get('counters')));
  }
}

export default CounterListModel;
