import { expect } from 'chai';
import Immutable from 'immutable';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { ensureValidators, checkWithValidators } from '../proptypes';

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

  describe('checkWithValidators', () => {
    it('Invalid number supplied to string', () => {
      expect(() => {
        checkWithValidators(
          { name: PropTypes.string },
          { name: 1 },
          'model Test',
          'prop'
        );
      }).to.throw('expected');
    });

    it('Invalid required string not supplied', () => {
      expect(() => {
        checkWithValidators(
          { name: PropTypes.string.isRequired },
          { name: null },
          'model Test',
          'prop'
        );
      }).to.throw(
        'The prop `name` is marked as required in `model Test`, but its value is `null`.'
      );
    });

    it('Valid required string', () => {
      expect(() => {
        checkWithValidators(
          { name: PropTypes.string.isRequired },
          { name: 'test' },
          'model Test',
          'prop'
        );
      }).to.not.throw;
    });

    it('Valid optional number not provided', () => {
      expect(() => {
        checkWithValidators(
          { count: PropTypes.number },
          { count: undefined },
          'model Test',
          'prop'
        );
      }).to.not.throw;
    });

    it('Invalid array supplied to List', () => {
      expect(() => {
        checkWithValidators(
          { arr: ImmutablePropTypes.list },
          { arr: [1, 2, 3] },
          'model Test',
          'prop'
        );
      }).to.throw(Error);
    });

    it('Invalid map shape supplied', () => {
      expect(() => {
        checkWithValidators(
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
        checkWithValidators(
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
});
