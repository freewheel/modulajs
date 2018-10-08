import { expect } from 'chai';
import { Model } from 'modula';
import createAction from '../create_action';

describe('createAction', () => {
  it('append path', () => {
    const model = new Model();

    expect(createAction(model, { type: 'ACTION' })).to.deep.equal({
      type: 'ACTION',
      path: []
    });
  });
});
