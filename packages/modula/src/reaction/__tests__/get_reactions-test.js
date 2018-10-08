import { expect } from 'chai';
import getReactions from '../get_reactions';
import { Model } from '../../model';

describe('reactions', () => {
  it('has one reaction by default', () => {
    class Test extends Model {}

    const model = new Test();

    const reactions = getReactions(model);
    expect(reactions.length).to.eq(1);
    expect(reactions[0].type).to.eq('TEST_UPDATE');
  });

  it('getReactions', () => {
    class Phone extends Model {
      recvOn() {
        return { type: 'ON' };
      }

      recvOff() {
        return { type: 'OFF' };
      }
    }

    const phone = new Phone();

    const reactions = getReactions(phone);

    expect(reactions.length).to.eq(3);
    expect(reactions.map(r => r.type)).to.have.members([
      'ON',
      'OFF',
      'PHONE_UPDATE'
    ]);
  });
});
