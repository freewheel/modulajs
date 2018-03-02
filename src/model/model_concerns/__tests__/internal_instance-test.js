import { expect } from 'chai';
import { keys } from 'lodash';
import { Map } from 'immutable';
import sinon from 'sinon';
import { InternalInstance } from '../internal_instance';

describe('InternalInstance', () => {
  it('init with no latest instance', () => {
    const instance = new InternalInstance({}, {});

    expect(instance.getLatestInstance()).to.be.null;
  });

  /* eslint-disable no-prototype-builtins */
  it('hasOwnProperty', () => {
    const instance = new InternalInstance({}, {});

    expect(instance.hasOwnProperty('__bindings__')).to.be.true;
    expect(instance.hasOwnProperty('__services__')).to.be.true;
  });
  /* eslint-enable no-prototype-builtins */

  it('setLatestInstance', () => {
    const model = {};
    const instance = new InternalInstance({}, {});
    instance.setLatestInstance(model);
    expect(instance.getLatestInstance()).to.equal(model);
  });

  describe('bindings', () => {
    it('bind only functions starting with send', () => {
      const instance = new InternalInstance(
        {
          sendA: a => a,
          sendB: '123',
          getC: a => a,
          setD: a => a
        },
        {}
      );

      expect(instance.hasBinding('sendA')).to.be.true;
      expect(instance.hasBinding('sendB')).to.be.false;
      expect(instance.hasBinding('getC')).to.be.false;
      expect(instance.hasBinding('setD')).to.be.false;
    });

    it('getBinding', () => {
      const sendA = sinon.spy();
      const instance = new InternalInstance({ sendA }, {});

      instance.getBinding('sendA')('a', 'b');

      expect(sendA.calledOnce).to.be.true;
      expect(sendA.calledWith('a', 'b')).to.be.true;
    });
  });

  describe('services', () => {
    it('get service', () => {
      const spy = sinon.spy();
      const latestInstance = sinon.spy();
      const instance = new InternalInstance(
        {},
        {
          test: function createService(getModel) {
            return {
              modelDidMount() {
                spy(getModel());
              }
            };
          }
        }
      );
      instance.setLatestInstance(latestInstance);

      const testService = instance.getService('test');

      expect(testService.modelDidMount).to.be.a('function');

      testService.modelDidMount();

      expect(spy.calledOnce).to.be.true;
      expect(spy.calledWith(latestInstance)).to.be.true;
    });

    it('get services', () => {
      const instance = new InternalInstance(
        {},
        {
          service1: function createService() {
            return {
              modelDidMount() {}
            };
          },
          service2: function createService() {
            return {
              modelWillUnmount() {}
            };
          },
          service3: function createService() {
            return {
              modelDidUpdate() {}
            };
          }
        }
      );

      const services = instance.getServices();

      expect(keys(services)).to.deep.include.members([
        'service1',
        'service2',
        'service3'
      ]);

      const { service1, service2, service3 } = services;

      expect(service1.modelDidMount).to.be.a('function');
      expect(service2.modelWillUnmount).to.be.a('function');
      expect(service3.modelDidUpdate).to.be.a('function');
    });
  });

  describe('localProps', () => {
    it('should turn localProps into a map', () => {
      const instance = new InternalInstance({}, {}, { foo: 1 });
      expect(instance.__localProps__).to.be.instanceof(Map);
      expect(instance.__localProps__.get('foo')).to.equal(1);
    });

    it('should be accessable via `getLocalProps`', () => {
      const instance = new InternalInstance({}, {}, { foo: 1 });
      expect(instance.__localProps__).to.equal(instance.getLocalProps());
    });

    it('should be updatable via `updateLocalProps`', () => {
      const instance = new InternalInstance({}, {}, { foo: 1 });
      const originalLocalProps = instance.__localProps__;
      instance.updateLocalProps({ foo: 2 });
      expect(instance.__localProps__.get('foo')).to.equal(2);
      expect(instance.__localProps__).to.not.equal(originalLocalProps);
    });
  });

  describe('subscription', () => {
    it('should call subscribe', () => {
      const spy = sinon.spy();
      const instance = new InternalInstance({}, {}, {});
      instance.__subscription__.subscribe = spy;
      const func = () => 1;
      instance.subscribe(func);

      expect(spy.calledOnce).to.be.true;
      expect(spy.calledWith(func)).to.be.true;
    });

    it('should call fire', () => {
      const spy = sinon.spy();
      const instance = new InternalInstance({}, {}, {});
      instance.__subscription__.fire = spy;
      instance.notifySubscribers();

      expect(spy.calledOnce).to.be.true;
    });
  });
});
