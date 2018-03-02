import { expect } from 'chai';
import { getReactions } from '../get_reactions';
import { Model } from '../../model';

describe('reactions', () => {
  it('has empty reactions by default', () => {
    const year2015 = new Model({});

    expect(getReactions(year2015)).to.be.empty;
  });

  it('getReactions', () => {
    const phone = new Model({
      extraBindings: {
        recvOn() {
          return { type: 'ON' };
        },

        recvOff() {
          return { type: 'OFF' };
        }
      }
    });

    expect(getReactions(phone)).to.deep.include.members([
      { type: 'ON' },
      { type: 'OFF' }
    ]);
  });
});
