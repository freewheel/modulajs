import { Model } from 'modula';
import { map, append, inc, dec, sum } from 'ramda';

const CounterActionTypes = {
  INCREMENT: 'COUNTER_INCREMENT',
  DECREMENT: 'COUNTER_DECREMENT'
};

class CounterModel extends Model {
  sendIncrement() {
    this.dispatch({ type: CounterActionTypes.INCREMENT });
  }

  recvIncrement() {
    return {
      type: CounterActionTypes.INCREMENT,
      update(model) {
        if (model.getContext('getIsLocked')()) {
          return [model];
        } else {
          const newModel = model.set('value', inc);

          return [newModel];
        }
      }
    };
  }

  sendDecrement() {
    this.dispatch({ type: CounterActionTypes.DECREMENT });
  }

  recvDecrement() {
    return {
      type: CounterActionTypes.DECREMENT,
      update(model) {
        const newModel = model.set('value', dec);

        return [newModel];
      }
    };
  }
}

CounterModel.actionTypes = CounterActionTypes;
CounterModel.defaultProps = {
  name: 'Counter',
  value: 0
};
CounterModel.contextTypes = {
  getIsLocked:
    'rely on the method to prevent total counter bigger than maximum value'
};

const MAX_SUM = 10;

const CounterListActionTypes = {
  COUNTER_ADD: 'COUNTER_LIST_COUNTER_ADD'
};

class CounterListModel extends Model {
  getChildContext() {
    return {
      getIsLocked: () => this.isMaximumCounts()
    };
  }

  sendCounterAdd() {
    this.dispatch({ type: CounterListActionTypes.COUNTER_ADD });
  }

  recvCounterAdd() {
    return {
      type: CounterListActionTypes.COUNTER_ADD,
      update(model) {
        const newModel = model.setMulti({
          counters: append(
            new CounterModel({ name: `Counter${model.get('globalId') + 1}` })
          ),
          globalId: inc
        });

        return [newModel];
      }
    };
  }

  getSum() {
    return sum(map(c => c.get('value'), this.get('counters')));
  }

  getMaxSum() {
    return MAX_SUM;
  }

  isMaximumCounts() {
    return this.getSum() >= MAX_SUM;
  }
}

CounterListModel.actionTypes = CounterListActionTypes;
CounterListModel.defaultProps = {
  // properties in defaults can be functions so they are only executed when the Model is initialized
  // it is useful when you need to do heavier computation like initialize another Model
  globalId: 0,
  counters: () => [new CounterModel()]
};
CounterListModel.childContextTypes = {
  getIsLocked: 'No params required. Return true or false.'
};

export default CounterListModel;
