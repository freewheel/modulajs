import { Model, whenMounted, whenUnmounted, whenUpdated } from 'modula';
import { map, append, inc, dec, sum, tail, empty } from 'ramda';

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
  COUNTER_ADD: 'COUNTER_LIST_COUNTER_ADD',
  COUNTER_REMOVE: 'COUNTER_LIST_COUNTER_REMOVE',
  MESSAGE_ADD: 'COUNTER_LIST_MESSAGE_ADD',
  MESSAGES_CLEAR: 'COUNTER_LIST_MESSAGES_CLEAR'
};

class CounterListModel extends Model {
  modelDidUpdate(oldModel, newModel) {
    whenMounted(oldModel, newModel, ['counters', 0], counter => {
      this.sendMessageAdd(
        `detected mount: first counter created, name is ${counter.get('name')}`
      );
    });

    whenUnmounted(oldModel, newModel, ['counters', 0], counter => {
      this.sendMessageAdd(
        `detected unmount: first counter destroyed, name is ${counter.get(
          'name'
        )}`
      );
    });

    whenUpdated(
      oldModel,
      newModel,
      ['counters', 0],
      (oldCounter, newCounter) => {
        this.sendMessageAdd(
          `detected updated: first counter updated, old value = ${oldCounter.get(
            'value'
          )}, new value = ${newCounter.get('value')}`
        );
      }
    );
  }

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

  sendCounterRemove() {
    this.dispatch({ type: CounterListActionTypes.COUNTER_REMOVE });
  }

  recvCounterRemove() {
    return {
      type: CounterListActionTypes.COUNTER_REMOVE,
      update(model) {
        return [model.set('counters', tail)];
      }
    };
  }

  sendMessageAdd(message) {
    this.dispatch({
      type: CounterListActionTypes.MESSAGE_ADD,
      payload: { message }
    });
  }

  recvMessageAdd() {
    return {
      type: CounterListActionTypes.MESSAGE_ADD,
      update(model, action) {
        const { message } = action.payload;

        return [model.set('messages', append(message))];
      }
    };
  }

  sendMessagesClear() {
    this.dispatch({ type: CounterListActionTypes.MESSAGES_CLEAR });
  }

  recvMessagesClear() {
    return {
      type: CounterListActionTypes.MESSAGES_CLEAR,
      update(model) {
        return [model.set('messages', empty)];
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
  counters: [],
  messages: []
};
CounterListModel.childContextTypes = {
  getIsLocked: 'No params required. Return true or false.'
};

export default CounterListModel;
