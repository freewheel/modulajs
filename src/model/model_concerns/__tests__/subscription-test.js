import { expect } from 'chai';
import sinon from 'sinon';
import Subscription from '../subscription';

describe('Subscription', () => {
  it('should call all listeners', () => {
    const callback1 = sinon.spy();
    const callback2 = sinon.spy();

    const subscription = Subscription();
    subscription.subscribe(callback1);
    subscription.subscribe(callback2);
    subscription.fire();

    expect(callback1.calledOnce).to.be.true;
    expect(callback2.calledOnce).to.be.true;
  });

  it('should return unsubscribe', () => {
    const callback = sinon.spy();

    const subscription = Subscription();
    const unsubscribe = subscription.subscribe(callback);
    subscription.fire();

    expect(callback.calledOnce).to.be.true;

    unsubscribe();
    subscription.fire();

    expect(callback.calledOnce).to.be.true;
  });

  it('should throw error if subscribe with non-function', () => {
    const subscription = Subscription();
    const subFunc = () => subscription.subscribe('not a function');
    expect(subFunc).to.throw('Expected listener to be a function.');
  });
});
