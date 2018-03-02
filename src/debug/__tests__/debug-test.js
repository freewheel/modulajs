import { expect } from 'chai';
import sinon from 'sinon';
import Debug from '../debug';

describe('Debug', () => {
  it('default disabled', () => {
    expect(Debug.isEnabled()).to.be.false;
  });

  it('enable and disable', () => {
    Debug.enable();
    expect(Debug.isEnabled()).to.be.true;

    Debug.disable();
    expect(Debug.isEnabled()).to.be.false;
  });

  it('skip callback when disabled', () => {
    const spy = sinon.spy();

    Debug.do(spy);

    expect(spy.called).to.be.false;
  });

  it('run do callback when enabled', () => {
    const spy = sinon.spy();

    Debug.enable();
    Debug.do(spy);
    Debug.disable();

    expect(spy.calledOnce).to.be.true;
  });

  it('skip info when disabled', () => {
    const stub = sinon.stub(console, 'info');

    Debug.info('foo', 'bar');

    stub.restore();

    expect(stub.called).to.be.false;
  });

  it('call console.info when enabled', () => {
    const stub = sinon.stub(console, 'info');

    Debug.enable();
    Debug.info('foo', 'bar');
    Debug.disable();

    stub.restore();

    expect(stub.calledOnce).to.be.true;
    expect(stub.firstCall.args).to.be.deep.equal(['foo', 'bar']);
  });

  it('skip warn when disabled', () => {
    const stub = sinon.stub(console, 'warn');

    Debug.warn('foo', 'bar');

    stub.restore();

    expect(stub.called).to.be.false;
  });

  it('call console.warn when enabled', () => {
    const stub = sinon.stub(console, 'warn');

    Debug.enable();
    Debug.warn('foo', 'bar');
    Debug.disable();

    stub.restore();

    expect(stub.calledOnce).to.be.true;
    expect(stub.firstCall.args).to.be.deep.equal(['foo', 'bar']);
  });

  it('skip error when disabled', () => {
    const stub = sinon.stub(console, 'error');

    Debug.error('foo', 'bar');

    stub.restore();

    expect(stub.called).to.be.false;
  });

  it('call console.error when enabled', () => {
    const stub = sinon.stub(console, 'error');

    Debug.enable();
    Debug.error('foo', 'bar');
    Debug.disable();

    stub.restore();

    expect(stub.calledOnce).to.be.true;
    expect(stub.firstCall.args).to.be.deep.equal(['foo', 'bar']);
  });
});
