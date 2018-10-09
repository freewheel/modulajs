import { Model } from 'modula';
import { append, inc, remove, length } from 'ramda';

const ActionTypes = {
  DELETE: 'TODOS_DELETE',
  ADD: 'TODOS_ADD'
};

class TodosModel extends Model {
  static actionTypes = ActionTypes;
  static defaultProps = {
    globalId: 4,
    todos: () => ['TODO Item 1', 'TODO Item 2', 'TODO Item 3', 'TODO Item 4']
  };

  sendDeleteOneByOne() {
    if (length(this.get('todos')) > 0) {
      // Simulate a server request roundtrip delay
      setTimeout(() => {
        this.dispatch({
          type: ActionTypes.DELETE,
          payload: { index: 0 }
        });
      }, 1000);
    }
  }

  recvDeleteOneByOne() {
    return {
      type: ActionTypes.DELETE,
      update(model, action) {
        const { index } = action.payload;
        const newModel = model.set('todos', remove(index, 1));

        // update returns an array
        // the first one is the updated model
        // and all the rest are side effect functions
        // which will be guaranteed to be called
        // but you should not assume they'll be call in strict order
        return [newModel, newModel.sendDeleteOneByOne];
      }
    };
  }

  sendAdd() {
    this.dispatch({ type: ActionTypes.ADD });
  }

  recvAdd() {
    return {
      type: ActionTypes.ADD,
      update(model) {
        const newModel = model.setMulti({
          todos: append(`TODO Item ${model.get('globalId') + 1}`),
          globalId: inc
        });

        return [newModel];
      }
    };
  }
}

export default TodosModel;
