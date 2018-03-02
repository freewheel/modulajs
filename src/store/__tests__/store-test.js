import { expect } from 'chai';
import PropTypes from 'prop-types';
import createStore from '../create_store';
import { createModel } from '../../model';
import { createConstants } from '../../constant';

const ActionTypes = createConstants('COUNTER', {
  INCREMENT: null,
  DECREMENT: null
});

const CounterModel = createModel({
  displayName: 'CounterModel',

  propTypes: {
    value: PropTypes.number.isRequired
  },

  defaults: {
    value: 0
  },

  sendIncrement() {
    this.dispatch({ type: ActionTypes.INCREMENT });
  },

  recvIncrement() {
    return {
      type: ActionTypes.INCREMENT,
      update(model) {
        const newModel = model.set('value', value => value + 1);

        return [newModel];
      }
    };
  },

  sendDecrement() {
    if (this.get('value') > 0) {
      this.dispatch({ type: ActionTypes.DECREMENT });
    }
  },

  recvDecrement() {
    return {
      type: ActionTypes.DECREMENT,
      update(model) {
        const newModel = model.set('value', value => value - 1);

        return [newModel];
      }
    };
  }
});

describe('A store could accept a decorated Model class', () => {
  it('should handle actions', () => {
    const store = createStore(CounterModel);

    const getRootModel = () => store.getState();
    getRootModel().sendInit();

    const getCounterModel = () => getRootModel().get('decoratedModel');

    getCounterModel().sendIncrement();
    expect(getCounterModel().get('value')).to.equal(1);

    getCounterModel().sendDecrement();
    expect(getCounterModel().get('value')).to.equal(0);
  });
});
