import { Model } from 'modula';
import { merge, assoc, pipe } from 'ramda';
import query from './user_query';
import { withSort, withPagination, appendSideEffect } from './user_list_mixins';

const ActionTypes = {
  LOAD: 'USER_LIST_LOAD'
};

const ListModel = withSort(withPagination(Model));

class UserListModel extends ListModel {
  // adding additional props to base ListModel
  static defaultProps = pipe(
    assoc('users', []),
    assoc('sort', { by: 'id', order: 'desc' }) // custom default sort
  )(ListModel.defaultProps);
  // adding additional action types to base ListModel
  static actionTypes = merge(ListModel.actionTypes, ActionTypes);

  modelDidMount() {
    this.sendLoad();
  }

  sendLoad() {
    const { page, perPage } = this.get('pagination');
    const { by, order } = this.get('sort');

    const users = query({ page, perPage, by, order });

    this.dispatch({
      type: ActionTypes.LOAD,
      payload: { users }
    });
  }

  recvLoad() {
    return {
      type: ActionTypes.LOAD,
      update(model, action) {
        const { users } = action.payload;

        return [model.set('users', users)];
      }
    };
  }

  // override recvSortBy which was defined in withSort mixin
  // adding additional side effect to default sort by behavior
  recvSortBy() {
    return appendSideEffect(super.recvSortBy, newModel => {
      newModel.sendPageChange(1);
      newModel.sendLoad();
    });
  }

  // override recvPageChange which was defined in withPagination mixin
  // adding additional side effect to default page change behavior
  recvPageChange() {
    return appendSideEffect(super.recvPageChange, newModel => {
      newModel.sendLoad();
    });
  }

  // override recvPerPageChange which was defined in withPagination mixin
  // adding additional side effect to default per page change behavior
  recvPerPageChange() {
    return appendSideEffect(super.recvPerPageChange, newModel => {
      newModel.sendLoad();
    });
  }
}

export default UserListModel;
