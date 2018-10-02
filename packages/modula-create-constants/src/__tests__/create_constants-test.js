import { expect } from 'chai';
import createConstants from '../create_constants';

describe('createConstants', () => {
  it('create constants with prefix', () => {
    const actions = createConstants('MY', {
      ITEM_UPDATE: null,
      ITEM_DELETE: null
    });

    expect(actions.ITEM_UPDATE).to.equal('MY_ITEM_UPDATE');
    expect(actions.ITEM_DELETE).to.equal('MY_ITEM_DELETE');
  });

  it('create constants with uppper case letters', () => {
    const actions = createConstants('my', {
      ItemUpdate: null,
      ItemDelete: null
    });

    expect(actions.ItemUpdate).to.equal('MY_ITEMUPDATE');
    expect(actions.ItemDelete).to.equal('MY_ITEMDELETE');
  });
});
