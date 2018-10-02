import { Model } from 'modula';
import {
  merge,
  assoc,
  slice,
  prop,
  pipe,
  sortBy,
  when,
  always,
  reverse
} from 'ramda';
import { withSort, withPagination, appendSideEffect } from './user_list_mixins';

const UserDB = [
  { id: 1, name: 'Diane' },
  { id: 2, name: 'Jon' },
  { id: 3, name: 'Doug' },
  { id: 4, name: 'Jack' },
  { id: 5, name: 'Kevin' },
  { id: 6, name: 'Micheal' },
  { id: 7, name: 'Joey' }
];

function query({ page, perPage, by, order }) {
  const sort = pipe(sortBy(prop(by)), when(always(order === 'desc'), reverse));
  const cutPage = slice((page - 1) * perPage, page * perPage);

  return pipe(sort, cutPage)(UserDB);
}

const TestActionTypes = {
  LOAD: 'TEST_LOAD'
};

class Test extends withSort(withPagination(Model)) {
  modelDidMount() {
    this.sendLoad();
  }

  sendLoad() {
    const { page, perPage } = this.get('pagination');
    const { by, order } = this.get('sort');

    const users = query({ page, perPage, by, order });

    this.dispatch({
      type: TestActionTypes.LOAD,
      payload: { users }
    });
  }

  recvLoad() {
    return {
      type: TestActionTypes.LOAD,
      update(model, action) {
        const { users } = action.payload;

        return [model.set('users', users)];
      }
    };
  }

  // adding additional side effect to default sort by behavior
  recvSortBy() {
    return appendSideEffect(super.recvSortBy, newModel => {
      newModel.sendPageChange(1);
      newModel.sendLoad();
    });
  }

  // adding additional side effect to default page change behavior
  recvPageChange() {
    return appendSideEffect(super.recvPageChange, newModel => {
      newModel.sendLoad();
    });
  }

  // adding additional side effect to default per page change behavior
  recvPerPageChange() {
    return appendSideEffect(super.recvPerPageChange, newModel => {
      newModel.sendLoad();
    });
  }
}

Test.defaultProps = pipe(
  assoc('users', []),
  assoc('sort', { by: 'id', order: 'desc' }) // custom default sort
)(Test.defaultProps);
Test.actionTypes = merge(Test.defaultProps, TestActionTypes);

export default Test;
