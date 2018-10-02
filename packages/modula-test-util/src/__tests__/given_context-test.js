import { expect } from 'chai';
import sinon from 'sinon';
import { Model } from 'modula';
import givenContext from '../given_context';

describe('givenContext', () => {
  it('provide context', () => {
    class Test extends Model {
      sendInit() {
        this.dispatch({ type: 'INIT' });
      }
    }

    const dispatch = sinon.spy();
    const model = givenContext({ dispatch }, new Test());

    model.sendInit();

    expect(dispatch.callCount).to.equal(1);
  });
});
