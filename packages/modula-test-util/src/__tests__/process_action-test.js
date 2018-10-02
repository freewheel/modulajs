import { expect } from 'chai';
import { Model } from 'modula';
import { getParentModel } from 'modula/dist/model';
import processAction from '../process_action';

describe('processAction', () => {
  it('keep parent pointer', () => {
    class Test extends Model {
      recvAction() {
        return {
          type: 'ACTION',
          update(m) {
            return [m.set('name', 'Spring')];
          }
        };
      }
    }

    Test.defaultProps = { name: '' };

    const model = new Test({ name: 'Poland' });

    class TestParent extends Model {}

    TestParent.defaultProps = {
      model: null
    };

    const parentModel = new TestParent({ model });

    const [newModel] = processAction(model, { type: 'ACTION' });

    expect(getParentModel(newModel)).to.equal(parentModel);
  });
});
