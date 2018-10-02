import { expect } from 'chai';
import sinon from 'sinon';
import { List, Map } from 'immutable';
import { whenMounted, whenUpdated, whenUnmounted } from '../when_changed';
import { Model } from '../../model';

describe('when changed', () => {
  class CounterListModel extends Model {}
  CounterListModel.defaultProps = {
    counters: []
  };

  class CounterModel extends Model {}
  CounterModel.defaultProps = {
    value: 0
  };

  it('mounted', () => {
    const oldModel = new CounterListModel();

    const counterModel = new CounterModel({ value: 1 });
    const newModel = oldModel.set('counters', [counterModel]);

    const mountedCall = sinon.spy();
    const unmountedCall = sinon.spy();
    const updatedCall = sinon.spy();

    whenMounted(oldModel, newModel, ['counters', 0], mountedCall);

    whenUnmounted(oldModel, newModel, ['counters', 0], unmountedCall);

    whenUpdated(oldModel, newModel, ['counters', 0], updatedCall);

    expect(mountedCall.calledOnce).to.be.true;
    expect(mountedCall.calledWith(counterModel)).to.be.true;

    expect(unmountedCall.notCalled).to.be.true;
    expect(updatedCall.notCalled).to.be.true;
  });

  it('unmounted', () => {
    const counterModel = new CounterModel({ value: 1 });
    const oldModel = new CounterListModel({
      counters: [counterModel]
    });

    const newModel = oldModel.set('counters', []);

    const mountedCall = sinon.spy();
    const unmountedCall = sinon.spy();
    const updatedCall = sinon.spy();

    whenMounted(oldModel, newModel, ['counters', 0], mountedCall);

    whenUnmounted(oldModel, newModel, ['counters', 0], unmountedCall);

    whenUpdated(oldModel, newModel, ['counters', 0], updatedCall);

    expect(mountedCall.notCalled).to.be.true;

    expect(unmountedCall.calledOnce).to.be.true;
    expect(unmountedCall.calledWith(counterModel)).to.be.true;

    expect(updatedCall.notCalled).to.be.true;
  });

  describe('updated', () => {
    class TestModel extends Model {}
    TestModel.defaultProps = {
      number: 0,
      boolean: true,
      string: 'a',
      nullable: null,
      array: [],
      object: {},
      list: new List(),
      map: new Map(),
      model: null
    };

    it('ignore null value', () => {
      const updatedCall = sinon.spy();

      const oldModel = new TestModel({ nullable: null });
      const newModel = oldModel.set('nullable', true);

      whenUpdated(oldModel, newModel, ['nullable'], updatedCall);
      whenUpdated(newModel, oldModel, ['nullable'], updatedCall);

      expect(updatedCall.notCalled).to.be.true;
    });

    it('supports number', () => {
      const updatedCall = sinon.spy();

      const oldModel = new TestModel({ number: 1 });
      const newModel = oldModel.set('number', 2);

      whenUpdated(oldModel, newModel, ['number'], updatedCall);

      expect(updatedCall.calledOnce).to.be.true;
      expect(updatedCall.calledWith(1, 2)).to.be.true;
    });

    it('supports boolean', () => {
      const updatedCall = sinon.spy();

      const oldModel = new TestModel({ boolean: true });
      const newModel = oldModel.set('boolean', false);

      whenUpdated(oldModel, newModel, ['boolean'], updatedCall);

      expect(updatedCall.calledOnce).to.be.true;
      expect(updatedCall.calledWith(true, false)).to.be.true;
    });

    it('supports string', () => {
      const updatedCall = sinon.spy();

      const oldModel = new TestModel({ string: 'a' });
      const newModel = oldModel.set('string', 'b');

      whenUpdated(oldModel, newModel, ['string'], updatedCall);

      expect(updatedCall.calledOnce).to.be.true;
      expect(updatedCall.calledWith('a', 'b')).to.be.true;
    });

    it('supports array', () => {
      const updatedCall = sinon.spy();

      const oldModel = new TestModel({ array: [1] });
      const newModel = oldModel.set('array', [1, 2]);

      whenUpdated(oldModel, newModel, ['array'], updatedCall);

      expect(updatedCall.calledOnce).to.be.true;
      expect(updatedCall.calledWithMatch([1], [1, 2])).to.be.true;
    });

    it('supports object', () => {
      const updatedCall = sinon.spy();

      const oldModel = new TestModel({ object: { a: 1 } });
      const newModel = oldModel.set('object', { a: 2 });

      whenUpdated(oldModel, newModel, ['object'], updatedCall);

      expect(updatedCall.calledOnce).to.be.true;
      expect(updatedCall.calledWithMatch({ a: 1 }, { a: 2 })).to.be.true;
    });

    it('supports immutable list', () => {
      const updatedCall = sinon.spy();

      const oldModel = new TestModel({ list: new List([1]) });
      const newModel = oldModel.set('list', l => l.push(2));

      whenUpdated(oldModel, newModel, ['list'], updatedCall);

      expect(updatedCall.calledOnce).to.be.true;

      const firstCall = updatedCall.getCall(0);
      expect(firstCall.args[0].toJS()).to.deep.equal([1]);
      expect(firstCall.args[1].toJS()).to.deep.equal([1, 2]);
    });

    it('supports immutable map', () => {
      const updatedCall = sinon.spy();

      const oldModel = new TestModel({ map: new Map({ a: 1 }) });
      const newModel = oldModel.set('map', m => m.set('a', 2));

      whenUpdated(oldModel, newModel, ['map'], updatedCall);

      expect(updatedCall.calledOnce).to.be.true;

      const firstCall = updatedCall.getCall(0);
      expect(firstCall.args[0].toJS()).to.deep.equal({ a: 1 });
      expect(firstCall.args[1].toJS()).to.deep.equal({ a: 2 });
    });

    it('supports modula model', () => {
      const updatedCall = sinon.spy();

      const oldInnerModel = new TestModel({ number: 1 });
      const newInnerModel = oldInnerModel.set('number', 2);

      const oldModel = new TestModel({ model: oldInnerModel });
      const newModel = oldModel.set('model', newInnerModel);

      whenUpdated(oldModel, newModel, ['model'], updatedCall);

      expect(updatedCall.calledOnce).to.be.true;
      expect(updatedCall.calledWith(oldInnerModel, newInnerModel)).to.be.true;
    });
  });
});
