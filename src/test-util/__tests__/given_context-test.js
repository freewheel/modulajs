import { expect } from 'chai';
import sinon from 'sinon';
import { Model } from '../../model';
import { givenContext } from '../given_context';

describe('givenContext', () => {
  it('provide context', () => {
    const dispatch = sinon.spy();
    const model = givenContext(
      { dispatch },
      new Model({
        extraBindings: {
          sendInit() {
            this.dispatch({ type: 'INIT' });
          }
        }
      })
    );

    model.sendInit();

    expect(dispatch.callCount).to.equal(1);
  });
});
