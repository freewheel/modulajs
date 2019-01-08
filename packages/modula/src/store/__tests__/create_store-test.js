import sinon from 'sinon';
import { identity, inc, dec } from 'ramda';
import { expect } from 'chai';
import createStore, { processSideEffects } from '../create_store';
import { Model } from '../../model';

describe('createStore', () => {
  const ActionTypes = {
    INCREMENT: 'INCREMENT',
    DECREMENT: 'DECREMENT'
  };

  class CounterModel extends Model {
    sendIncrement() {
      this.dispatch({ type: ActionTypes.INCREMENT });
    }

    recvIncrement() {
      return {
        type: ActionTypes.INCREMENT,
        update(model) {
          return [model.set('value', inc)];
        }
      };
    }

    sendDecrement() {
      this.dispatch({ type: ActionTypes.DECREMENT });
    }

    recvDecrement() {
      return {
        type: ActionTypes.DECREMENT,
        update(model) {
          return [model.set('value', dec)];
        }
      };
    }
  }
  CounterModel.defaultProps = { value: 0 };

  it('create a store which has a state of a root model', () => {
    const store = createStore(CounterModel, identity);

    expect(store.getState()).to.be.an.instanceof(Model);
  });

  it('handle actions', () => {
    const store = createStore(CounterModel, identity);

    store.getState().sendInit();

    expect(store.getState().getIn(['decoratedModel', 'value'])).to.eq(0);

    store
      .getState()
      .get('decoratedModel')
      .sendIncrement();
    expect(store.getState().getIn(['decoratedModel', 'value'])).to.eq(1);

    store
      .getState()
      .get('decoratedModel')
      .sendDecrement();
    expect(store.getState().getIn(['decoratedModel', 'value'])).to.eq(0);
  });

  it('process side effects', () => {
    const clock = sinon.useFakeTimers();

    const model = {};
    const sideEffect1 = sinon.spy();
    const sideEffect2 = sinon.spy();

    expect(processSideEffects([model, sideEffect1, sideEffect2])).to.equal(
      model
    );

    clock.tick(1);
    clock.restore();

    expect(sideEffect1.calledOnce).to.be.true;
    expect(sideEffect2.calledOnce).to.be.true;
  });

  describe('child model initialization', () => {
    it('modelDidMount', () => {
      const clock = sinon.useFakeTimers();
      const spyDidMount = sinon.spy();
      const spyInit = sinon.spy();

      class TestModel extends Model {
        modelDidMount() {
          spyDidMount();
        }

        sendInit() {
          spyInit();
        }
      }

      const store = createStore(TestModel, identity);
      store.getState().sendInit();

      clock.tick(1);
      clock.restore();

      expect(spyDidMount.calledOnce).to.be.true;
      expect(spyInit.notCalled).to.be.true;
    });

    it('modelDidMount for deeper models', () => {
      const clock = sinon.useFakeTimers();
      const spyChildDidMount = sinon.spy();

      class TestChildModel extends Model {
        modelDidMount() {
          spyChildDidMount();
        }
      }

      const spyDidMount = sinon.spy();

      class TestModel extends Model {
        modelDidMount() {
          spyDidMount();
        }
      }
      TestModel.defaultProps = {
        child: () => new TestChildModel()
      };

      const store = createStore(TestModel, identity);
      store.getState().sendInit();

      clock.tick(1);
      clock.restore();

      expect(spyChildDidMount.calledOnce).to.be.true;
      expect(spyDidMount.calledOnce).to.be.true;
    });

    it('modelWillUnmount', () => {
      const clock = sinon.useFakeTimers();
      const spy = sinon.spy();

      class TestModel extends Model {
        modelWillUnmount() {
          spy();
        }
      }

      const store = createStore(TestModel, identity);
      store.getState().sendInit();

      clock.tick(1);

      store.getState().sendDestroy();

      clock.tick(1);
      clock.restore();

      expect(spy.calledOnce).to.be.true;
    });
  });
});
