import { expect } from 'chai';
import sinon from 'sinon';
import PropTypes from 'prop-types';
import { createTreeModel } from '../tree_model';
import { Debug } from '../../debug';

describe('TreeModel', () => {
  it('create model which has a get method', () => {
    const Model = createTreeModel({
      propTypes: { name: PropTypes.string },
      defaults: { name: null }
    });
    const m1 = new Model({ name: 'hello' });

    expect(m1.get('name')).to.equal('hello');
  });

  it('create model which has a set method', () => {
    const Model = createTreeModel({
      propTypes: { name: PropTypes.string },
      defaults: { name: null }
    });
    const m1 = new Model({ name: 'hello' });

    expect(m1.set('name', 'hi').get('name')).to.equal('hi');
  });

  it('create model which holds the default value', () => {
    const Model = createTreeModel({
      propTypes: { name: PropTypes.string },
      defaults: { name: 'hello' }
    });

    expect(new Model().get('name')).to.equal('hello');
  });

  it('create model which holds the default value from a function', () => {
    const Model = createTreeModel({
      propTypes: { age: PropTypes.number },
      defaults() {
        return {
          age: 42
        };
      }
    });

    expect(new Model().get('age')).to.equal(42);
  });

  it('create model which holds default value which is a function', () => {
    const Model = createTreeModel({
      propTypes: {
        id: PropTypes.number,
        name: PropTypes.string
      },

      defaults: {
        id: null,
        name: () => 'hi'
      }
    });

    expect(new Model().get('name')).to.equal('hi');
  });

  it('create model which has a setMulti method', () => {
    const Model = createTreeModel({
      propTypes: {
        id: PropTypes.number,
        name: PropTypes.string
      },

      defaults: {
        id: null,
        name: null
      }
    });

    const m1 = new Model({ id: 1, name: 'hi' });
    const m2 = m1.setMulti({
      id: 2,
      name: 'no'
    });

    expect(m2.get('id')).to.equal(2);
    expect(m2.get('name')).to.equal('no');
  });

  it('create model which has a attributes method', () => {
    const Model = createTreeModel({
      propTypes: {
        id: PropTypes.number,
        name: PropTypes.string
      },

      defaults: {
        id: null,
        name: null
      }
    });

    const m1 = new Model({ id: 1, name: 'hi' });

    expect(m1.attributes()).to.deep.equal({
      id: 1,
      name: 'hi'
    });
  });

  it('create model which has a mutate method', () => {
    const Model = createTreeModel({
      propTypes: {
        id: PropTypes.number,
        name: PropTypes.string
      },

      defaults: {
        id: null,
        name: null
      }
    });

    const m1 = new Model({ id: 1, name: 'hi' });
    const m2 = m1.mutate('id', id => id + 1);

    expect(m2.get('id')).to.equal(2);
  });

  it('create model which keeps the context id after attribute mutation', () => {
    const Model = createTreeModel({
      propTypes: { id: PropTypes.number },
      defaults: { id: null }
    });
    const m1 = new Model({ id: 1 });
    const m2 = m1.set('id', 2);
    expect(m2.uid).to.equal(m1.uid);
  });

  it('setMulti should validate props', () => {
    Debug.enable();

    const Model = createTreeModel({
      displayName: 'Model',
      propTypes: { id: PropTypes.number },
      defaults: { id: null }
    });
    const m1 = new Model({ id: 1 });
    const validateProps = sinon.stub(m1, 'validateProps');
    m1.set('id', 2);
    expect(validateProps.calledOnce).to.be.true;
    expect(
      validateProps.calledWith(
        { id: 2 },
        { id: PropTypes.number },
        'model Model'
      )
    ).to.be.true;

    Debug.disable();
  });

  it('model instanceOf', () => {
    const Model = createTreeModel({
      propTypes: { id: PropTypes.number },
      defaults: { id: null }
    });
    const Model2 = createTreeModel(
      {
        propTypes: { id: PropTypes.number },
        defaults: { id: null }
      },
      Model
    );
    const Model3 = createTreeModel(
      {
        propTypes: {
          id: PropTypes.number,
          name: PropTypes.string
        },
        defaults: {
          id: null,
          name: null
        }
      },
      Model2
    );
    const m = new Model3({ id: 1 });
    expect(m).to.be.instanceOf(Model3);
    expect(m).to.be.instanceOf(Model2);
    expect(m).to.be.instanceOf(Model);
    const m2 = m.set('id', 2);
    expect(m2.get('id')).to.equal(2);
    const m3 = m2.set('name', 'test');
    expect(m3.get('name')).to.equal('test');
  });
});
