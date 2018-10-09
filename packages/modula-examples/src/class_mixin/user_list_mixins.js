import { append, merge, assoc, __ } from 'ramda';

const nextOrder = order => {
  if (order === 'desc') {
    return 'asc';
  } else if (order === 'asc') {
    return 'desc';
  } else {
    return 'desc';
  }
};

export const withSort = S => {
  const ActionTypes = {
    SORT_BY: 'SORT_MIXIN_SORT_BY'
  };

  class ExtS extends S {
    sendSortBy(by, order) {
      this.dispatch({
        type: ActionTypes.SORT_BY,
        payload: { by, order }
      });
    }

    recvSortBy() {
      return {
        type: ActionTypes.SORT_BY,
        update(model, action) {
          const { by, order } = action.payload;

          return [model.set('sort', { by, order })];
        }
      };
    }

    sendSortToggle(newBy) {
      const { by, order } = this.get('sort');

      if (newBy === by) {
        this.sendSortBy(newBy, nextOrder(order));
      } else {
        this.sendSortBy(newBy, 'desc');
      }
    }

    isSortAsc(questionBy) {
      const { by, order } = this.get('sort');

      return questionBy === by && order === 'asc';
    }

    isSortDesc(questionBy) {
      const { by, order } = this.get('sort');

      return questionBy === by && order === 'desc';
    }
  }

  ExtS.defaultProps = assoc(
    'sort',
    {
      by: null,
      order: null
    },
    S.defaultProps
  );

  ExtS.actionTypes = merge(S.actionTypes, ActionTypes);

  return ExtS;
};

export const withPagination = P => {
  const ActionTypes = {
    PAGE_CHANGE: 'PAGINATION_MIXIN_PAGE_CHANGE',
    PER_PAGE_CHANGE: 'PAGINATION_MIXIN_PER_PAGE_CHANGE'
  };

  class ExtP extends P {
    sendPageChange(page) {
      this.dispatch({
        type: ActionTypes.PAGE_CHANGE,
        payload: { page }
      });
    }

    recvPageChange() {
      return {
        type: ActionTypes.PAGE_CHANGE,
        update(model, action) {
          const { page } = action.payload;

          return [model.set('pagination', assoc('page', page))];
        }
      };
    }

    sendPerPageChange(perPage) {
      this.dispatch({
        type: ActionTypes.PER_PAGE_CHANGE,
        payload: { perPage }
      });
    }

    recvPerPageChange() {
      return {
        type: ActionTypes.PER_PAGE_CHANGE,
        update(model, action) {
          const { perPage } = action.payload;

          return [model.set('pagination', merge(__, { page: 1, perPage }))];
        }
      };
    }

    getPage() {
      return this.getIn(['pagination', 'page']);
    }

    getPerPage() {
      return this.getIn(['pagination', 'perPage']);
    }
  }

  ExtP.defaultProps = assoc(
    'pagination',
    {
      page: 1,
      perPage: 5
    },
    ExtP.defaultProps
  );

  ExtP.actionTypes = merge(ExtP.actionTypes, ActionTypes);

  return ExtP;
};

export function appendSideEffect(superReceiver, sideEffectFunction) {
  const { type, update: defaultUpdate } = superReceiver();

  return {
    type,
    update(model, action) {
      const effects = defaultUpdate(model, action);

      return append(() => {
        sideEffectFunction(effects[0]);
      }, effects);
    }
  };
}
