import { createModel, createConstants } from 'modulajs'; // eslint-disable-line
import PropTypes from 'prop-types';

export const ActionTypes = createConstants('COUNTER', {
  INCREMENT: null,
  DECREMENT: null
});

export const CounterModel = createModel({
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
  },

  getEvenOrOdd() {
    return this.get('value') % 2 === 0 ? 'even' : 'odd';
  }
});
