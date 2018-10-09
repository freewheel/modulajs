import { Model, whenMounted, whenUnmounted, whenUpdated } from 'modula';
import { map, append, inc, sum, tail, empty } from 'ramda';

// reuse model from previous Counter example
import CounterModel from '../counter/counter_model';

const ActionTypes = {
  COUNTER_ADD: 'COUNTER_LIST_COUNTER_ADD',
  COUNTER_REMOVE: 'COUNTER_LIST_COUNTER_REMOVE',
  MESSAGE_ADD: 'COUNTER_LIST_MESSAGE_ADD',
  MESSAGES_CLEAR: 'COUNTER_LIST_MESSAGES_CLEAR'
};

class CounterListModel extends Model {
  static actionTypes = ActionTypes;
  static defaultProps = {
    globalId: 0,
    counters: [],
    messages: []
  };

  // will be called when the model is attached to the root state tree
  modelDidMount() {
    this.sendMessageAdd('CounterListModel did mount');
  }

  // will be called whenever current model gets updated
  modelDidUpdate(oldModel, newModel) {
    // you can utilize modelDidUpdate to detect deeply nested model changes
    whenMounted(oldModel, newModel, ['counters', 0], counter => {
      this.sendMessageAdd(
        `detected mount: first counter created, initial value = ${counter.get(
          'value'
        )}`
      );
    });

    whenUnmounted(oldModel, newModel, ['counters', 0], counter => {
      this.sendMessageAdd(
        `detected unmount: first counter destroyed, value = ${counter.get(
          'value'
        )}`
      );
    });

    whenUpdated(
      oldModel,
      newModel,
      ['counters', 0],
      (oldCounter, newCounter) => {
        this.sendMessageAdd(
          `detected updated: first counter value updated from ${oldCounter.get(
            'value'
          )} => ${newCounter.get('value')}`
        );
      }
    );
  }

  // will be called when current model is going to detach from root state tree
  modelWillUnmount() {
    this.sendMessageAdd('CounterListModel will unmount');
  }

  sendCounterAdd() {
    this.dispatch({ type: ActionTypes.COUNTER_ADD });
  }

  recvCounterAdd() {
    return {
      type: ActionTypes.COUNTER_ADD,
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
    this.dispatch({ type: ActionTypes.COUNTER_REMOVE });
  }

  recvCounterRemove() {
    return {
      type: ActionTypes.COUNTER_REMOVE,
      update(model) {
        return [model.set('counters', tail)];
      }
    };
  }

  sendMessageAdd(message) {
    this.dispatch({
      type: ActionTypes.MESSAGE_ADD,
      payload: { message }
    });
  }

  recvMessageAdd() {
    return {
      type: ActionTypes.MESSAGE_ADD,
      update(model, action) {
        const { message } = action.payload;

        return [model.set('messages', append(message))];
      }
    };
  }

  sendMessagesClear() {
    this.dispatch({ type: ActionTypes.MESSAGES_CLEAR });
  }

  recvMessagesClear() {
    return {
      type: ActionTypes.MESSAGES_CLEAR,
      update(model) {
        return [model.set('messages', empty)];
      }
    };
  }

  getSum() {
    return sum(map(c => c.get('value'), this.get('counters')));
  }
}

export default CounterListModel;
