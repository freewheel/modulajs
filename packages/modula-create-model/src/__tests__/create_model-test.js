import { expect } from 'chai';
import PropTypes from 'proptypes';
import createModel from '../create_model';

describe('Create Model', () => {
  it('create model which has a get method', () => {
    const Test = createModel({
      propTypes: { name: PropTypes.string },
      defaults: { name: null }
    });
    const m1 = new Test({ name: 'hello' });

    expect(m1.get('name')).to.equal('hello');
  });

  it('create model which has a set method', () => {
    const Model = createModel({
      propTypes: { name: PropTypes.string },
      defaults: { name: null }
    });
    const m1 = new Model({ name: 'hello' });

    expect(m1.set('name', 'hi').get('name')).to.equal('hi');
  });

  it('create model which holds the default value', () => {
    const Model = createModel({
      propTypes: { name: PropTypes.string },
      defaults: { name: 'hello' }
    });

    expect(new Model().get('name')).to.equal('hello');
  });

  it('create model which holds default value which is a function', () => {
    const Model = createModel({
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
    const Model = createModel({
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

  it('create model which has a props method', () => {
    const Model = createModel({
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

    expect(m1.props()).to.deep.equal({
      id: 1,
      name: 'hi'
    });
  });

  it('create model which has a set method', () => {
    const Model = createModel({
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
    const m2 = m1.set('id', id => id + 1);

    expect(m2.get('id')).to.equal(2);
  });

  it('model instanceOf', () => {
    const Model = createModel({
      propTypes: { id: PropTypes.number },
      defaults: { id: null }
    });
    const Model2 = createModel(
      {
        propTypes: { id: PropTypes.number },
        defaults: { id: null }
      },
      Model
    );
    const Model3 = createModel(
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

    expect(m).not.to.be.instanceOf(Model2);

    expect(m).not.to.be.instanceOf(Model);
    const m2 = m.set('id', 2);
    expect(m2.get('id')).to.equal(2);
    const m3 = m2.set('name', 'test');
    expect(m3.get('name')).to.equal('test');
  });
});
