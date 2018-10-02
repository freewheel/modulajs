import React from 'react';
import { expect } from 'chai';
import Enzyme, { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import sinon from 'sinon';
import { identity } from 'ramda';
import { createStore, Model } from 'modula';
import createContainer from '../create_container';

Enzyme.configure({ adapter: new Adapter() });

describe('createContainer', () => {
  describe('store', () => {
    const INCREMENT = 'INCREMENT';
    const NAME_CHANGE = 'NAME_CHANGE';
    const BOTH_CHANGE = 'BOTH_CHANGE';

    class CounterModel extends Model {
      sendIncrement() {
        this.dispatch({ type: INCREMENT });
      }

      recvIncrement() {
        return {
          type: INCREMENT,
          update(model) {
            return [model.mutate('count', count => count + 1)];
          }
        };
      }

      sendNameChange(name) {
        this.dispatch({ type: NAME_CHANGE, payload: { name } });
      }

      recvNameChange() {
        return {
          type: NAME_CHANGE,
          update(model, action) {
            const { name } = action.payload;

            return [model.set('name', name)];
          }
        };
      }

      sendBothChange() {
        this.dispatch({ type: BOTH_CHANGE });
      }

      recvBothChange() {
        return {
          type: BOTH_CHANGE,
          update(model) {
            return [
              model.setMulti({
                name: 'test',
                count: count => count + 1
              })
            ];
          }
        };
      }
    }
    CounterModel.defaultProps = {
      count: 0
    };
    CounterModel.contextTypes = {
      dispatch: null
    };

    const CounterComponent = ({ model }) => (
      <div>
        <div id="counter">{model.get('count')}</div>
        <button onClick={model.sendIncrement}>Increase</button>
      </div>
    );

    // temporary disable it until enzy has support for context provider
    xit('setup a world where root model and component are connected and are responsible for actions', () => {
      const store = createStore(CounterModel, identity);
      const Container = createContainer(store, CounterComponent);

      const wrapper = mount(<Container />);

      expect(wrapper.find('#counter').text()).to.equal('0');

      wrapper.find('button').simulate('click');

      expect(wrapper.find('#counter').text()).to.equal('1');
    });

    it('subscribe to store on mount', () => {
      const store = createStore(CounterModel, identity);
      const Container = createContainer(store, CounterComponent);

      const wrapper = shallow(<Container />);
      const instance = wrapper.instance();

      expect(instance.unsubscribe).to.be.a('function');

      const unsubscribe = sinon.spy();

      const subscribe = sinon.stub(store, 'subscribe').returns(unsubscribe);

      const sendInit = sinon.spy();
      sinon.stub(store, 'getState').returns({
        sendInit
      });

      instance.componentWillMount();

      expect(subscribe.calledOnce).to.be.true;

      expect(instance.unsubscribe).to.equal(unsubscribe);
      expect(sendInit.calledOnce).to.be.true;
    });

    it('unsubscribe from store after component has been unmounted', () => {
      const store = createStore(CounterModel, identity);
      const Container = createContainer(store, CounterComponent);

      const wrapper = shallow(<Container />);
      const instance = wrapper.instance();

      const unsubscribe = sinon.stub(instance, 'unsubscribe').returns(true);

      const sendDestroy = sinon.spy();
      sinon.stub(store, 'getState').returns({
        sendDestroy
      });

      wrapper.unmount();

      expect(unsubscribe.calledOnce).to.be.true;
      expect(sendDestroy.calledOnce).to.be.true;
    });
  });
});
