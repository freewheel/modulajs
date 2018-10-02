import { expect } from 'chai';
import Immutable from 'immutable';
import PropTypes from 'proptypes';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { ensureValidators, checkValues, checkKeys } from '../validations';

describe('prop types', () => {
  describe('ensureValidators', () => {
    it('throw if defaults not provided', () => {
      expect(() => {
        ensureValidators(
          { name: PropTypes.string },
          undefined,
          'model Test',
          'prop types',
          'default props'
        );
      }).to.throw(
        'Key "name" defined in prop types but is missing in default props for model Test'
      );
    });

    it('throw if propTypes not provided', () => {
      expect(() => {
        ensureValidators(
          undefined,
          { name: 1 },
          'model Test',
          'prop types',
          'default props'
        );
      }).to.throw(
        'Key "name" defined in default props but is missing in prop types for model Test'
      );
    });
  });

  describe('checkValues', () => {
    it('Invalid number supplied to string', () => {
      expect(() => {
        checkValues(
          { name: PropTypes.string },
          { name: 1 },
          'model Test',
          'prop'
        );
      }).to.throw('expected');
    });

    it('Invalid required string not supplied', () => {
      expect(() => {
        checkValues(
          { name: PropTypes.string.isRequired },
          { name: null },
          'model Test',
          'prop'
        );
      }).to.throw('Required');
    });

    it('Valid required string', () => {
      expect(() => {
        checkValues(
          { name: PropTypes.string.isRequired },
          { name: 'test' },
          'model Test',
          'prop'
        );
      }).to.not.throw;
    });

    it('Valid optional number not provided', () => {
      expect(() => {
        checkValues(
          { count: PropTypes.number },
          { count: undefined },
          'model Test',
          'prop'
        );
      }).to.not.throw;
    });

    it('Invalid array supplied to List', () => {
      expect(() => {
        checkValues(
          { arr: ImmutablePropTypes.list },
          { arr: [1, 2, 3] },
          'model Test',
          'prop'
        );
      }).to.throw(Error);
    });

    it('Invalid map shape supplied', () => {
      expect(() => {
        checkValues(
          {
            map: ImmutablePropTypes.mapContains({
              name: PropTypes.string.isRequired,
              count: PropTypes.number.isRequired
            })
          },
          Immutable.Map({ name: undefined, count: 1 }),
          'model Test',
          'prop'
        );
      }).to.throw(Error);
    });

    it('Valid map shape', () => {
      expect(() => {
        checkValues(
          {
            map: ImmutablePropTypes.mapContains({
              name: PropTypes.string.isRequired,
              count: PropTypes.number.isRequired
            })
          },
          Immutable.Map({ name: '', count: 1 }),
          'model Test',
          'prop'
        );
      }).to.not.throw;
    });
  });

  describe('checkKeys', () => {
    it('throw if defaults not provided', () => {
      expect(() => {
        checkKeys(
          {
            isLoading: PropTypes.bool,
            name: PropTypes.string
          },
          { name: 'hi', title: 'title' },
          'Test',
          'propTypes'
        );
      }).to.throw(
        'Setting property title on Test which is not defined in propTypes'
      );
    });

    it('not throw if defaults provided', () => {
      expect(() => {
        checkKeys(
          {
            isLoading: PropTypes.bool,
            name: PropTypes.string
          },
          { name: 'hi' },
          'Test',
          'propTypes'
        );
      }).to.not.throw(Error);
    });
  });
});
