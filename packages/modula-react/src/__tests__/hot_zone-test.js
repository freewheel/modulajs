import { expect } from 'chai';
import { identity } from 'ramda';
import { Model } from 'modula';
import { List, Map } from 'immutable';
import {
  isValidWatchPath,
  standardizeAttrOption,
  spreadWatchPath
} from '../hot_zone';

// TODO wait until enzyme has support for new context api
// currently verified by modula-examples
describe('hotZone', () => {
  // hotZone(c)
  it('supports component that has a model props');

  // hotZone(c, {
  //   modelA: modelA,
  //   modelB: modelB
  // })
  it('supports component that has multiple models');

  // hotZone(c, {
  //   name: {
  //     from: model,
  //     watch: ['name']
  //   }
  // })
  it('supports passing customized attributes mapping');

  describe('multiple hotZones in component tree', () => {
    it('supports nested hotZone calls');
    it('supports sibling hotZone calls');
  });

  // hotZone(c, {
  //   sum: {
  //     from: model,
  //     watch: ['counters', '*']
  //   },
  //   isMax: {
  //     from: model,
  //     watch: ['counters', [0, 1]]
  //   }
  // })
  describe('spreadWatchPath', () => {
    class TestModel extends Model {}
    TestModel.defaultProps = {
      object: { a: 1, b: 2 },
      array: [1, 2],
      list: new List([1, 2]),
      map: new Map({ a: 1, b: 2 }),
      nested: [[1, 2, 3], [4, 5, 6]],
      deep: null
    };

    it('supports [] in watch option to expand multiple', () => {
      expect(
        spreadWatchPath({
          from: new TestModel({ deep: new TestModel() }),
          watch: ['deep', ['array', 'list']]
        })
      ).to.deep.equal([['deep', 'array'], ['deep', 'list']]);
    });

    it('supports * in watch option to expand object', () => {
      expect(
        spreadWatchPath({
          from: new TestModel({ deep: new TestModel() }),
          watch: ['deep', 'object', '*']
        })
      ).to.deep.equal([['deep', 'object', 'a'], ['deep', 'object', 'b']]);
    });

    it('supports * in watch option to expand array', () => {
      expect(
        spreadWatchPath({
          from: new TestModel({ deep: new TestModel() }),
          watch: ['deep', 'array', '*']
        })
      ).to.deep.equal([['deep', 'array', 0], ['deep', 'array', 1]]);
    });

    it('supports * in watch option to expand immutable', () => {
      expect(
        spreadWatchPath({
          from: new TestModel({ deep: new TestModel() }),
          watch: ['deep', 'list', '*']
        })
      ).to.deep.equal([['deep', 'list', 0], ['deep', 'list', 1]]);

      expect(
        spreadWatchPath({
          from: new TestModel({ deep: new TestModel() }),
          watch: ['deep', 'map', '*']
        })
      ).to.deep.equal([['deep', 'map', 'a'], ['deep', 'map', 'b']]);
    });

    it('supports multiple * in watch option', () => {
      expect(
        spreadWatchPath({
          from: new TestModel({ deep: new TestModel() }),
          watch: ['nested', '*', '*']
        })
      ).to.deep.equal([
        ['nested', 0, 0],
        ['nested', 0, 1],
        ['nested', 0, 2],
        ['nested', 1, 0],
        ['nested', 1, 1],
        ['nested', 1, 2]
      ]);
    });
  });

  describe('isValidWatchPath', () => {
    it('valid combination', () => {
      expect(isValidWatchPath(['a', 0, ['a'], '*'])).to.be.true;
    });

    it('invalid cases', () => {
      expect(isValidWatchPath([[]])).to.be.false;
      expect(isValidWatchPath([[1]])).to.be.false;
      expect(isValidWatchPath([true])).to.be.false;
      expect(isValidWatchPath([{}])).to.be.false;
    });

    it('any invalid will fail', () => {
      expect(isValidWatchPath([1, 'a', [], '*'])).to.be.false;
    });
  });

  describe('standardizeAttrOption', () => {
    it('throws when option is not a model or object', () => {
      expect(() => {
        standardizeAttrOption('name', []);
      }).to.throw(
        'option is neither modula model or an object for hotZone attr "name"'
      );

      expect(() => {
        standardizeAttrOption('name', null);
      }).to.throw(
        'option is neither modula model or an object for hotZone attr "name"'
      );

      expect(() => {
        standardizeAttrOption('name', undefined);
      }).to.throw(
        'option is neither modula model or an object for hotZone attr "name"'
      );
    });

    it('throws when option is an object but missing key "from"', () => {
      expect(() => {
        standardizeAttrOption('name', { watch: [] });
      }).to.throw(
        '"from" in the option is not a modula model for hotZone attr "name"'
      );

      expect(() => {
        standardizeAttrOption('name', { from: 'a' });
      }).to.throw(
        '"from" in the option is not a modula model for hotZone attr "name"'
      );
    });

    it('supports model as option', () => {
      const option = new Model();

      expect(standardizeAttrOption('name', option)).to.deep.equal({
        from: option,
        watch: [],
        get: identity
      });
    });

    it('supports object option without watch', () => {
      const option = new Model();

      const finalOption = standardizeAttrOption('name', {
        from: option
      });

      expect(finalOption.from).to.eq(option);
      expect(finalOption.watch).to.deep.equal([]);
      expect(finalOption.get(option)).to.eq(option);
    });

    it('supports object option without get', () => {
      class TestModel extends Model {}
      TestModel.defaultProps = {
        name: 'a'
      };

      const option = new TestModel({ name: 'a' });

      const finalOption = standardizeAttrOption('name', {
        from: option,
        watch: ['name']
      });

      expect(finalOption.from).to.eq(option);
      expect(finalOption.watch).to.deep.equal(['name']);
      expect(finalOption.get(option)).to.eq('a');
    });
  });
});
