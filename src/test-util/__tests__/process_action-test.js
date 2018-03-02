import { expect } from 'chai';
import PropTypes from 'prop-types';
import { Model } from '../../model';
import { processAction } from '../process_action';
import { getParentModel } from '../../model/model_concerns/parent_pointer';

describe('processAction', () => {
  it('append uid', () => {
    const model = new Model({
      propTypes: {
        name: PropTypes.string
      },

      defaultProps: {
        name: 'Poland'
      },

      extraBindings: {
        recvAction() {
          return {
            type: 'ACTION',
            update(m) {
              return [m.set('name', 'Spring')];
            }
          };
        }
      }
    });

    const [newModel] = processAction(model, { type: 'ACTION' });
    expect(newModel.uid).to.equal(model.uid);
  });

  it('keep parent pointer', () => {
    const model = new Model({
      propTypes: {
        name: PropTypes.string
      },

      defaultProps: {
        name: 'Poland'
      },

      extraBindings: {
        recvAction() {
          return {
            type: 'ACTION',
            update(m) {
              return [m.set('name', 'Spring')];
            }
          };
        }
      }
    });

    const parentModel = new Model({
      propTypes: {
        model: PropTypes.any
      },

      defaultProps: {
        model: () => model
      }
    });

    const [newModel] = processAction(model, { type: 'ACTION' });
    expect(getParentModel(newModel)).to.equal(parentModel);
  });
});
