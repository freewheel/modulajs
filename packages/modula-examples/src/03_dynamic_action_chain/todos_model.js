import { Model } from 'modula';
import { append, inc, remove, length } from 'ramda';

const ActionTypes = {
  DELETE: 'TODOS_DELETE',
  ADD: 'TODOS_ADD'
};

class TodosModel extends Model {
  sendDeleteOneByOne() {
    if (length(this.get('todos')) > 0) {
      const index = 0;
      // Simulate a server request
      setTimeout(() => {
        this.dispatch({
          type: ActionTypes.DELETE,
          payload: { index }
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

TodosModel.actionTypes = ActionTypes;
TodosModel.defaultProps = {
  globalId: 4,
  todos: () => ['TODO Item 1', 'TODO Item 2', 'TODO Item 3', 'TODO Item 4']
};

export default TodosModel;
