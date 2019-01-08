import { expect } from 'chai';
import { List, Map } from 'immutable';
import { Model } from 'modula';
import pathDiff from '../path_diff';

describe('pathDiff', () => {
  it('diff primitive type', () => {
    expect(pathDiff([], true, true)).to.deep.equal({
      updatedPaths: [],
      deletedPaths: [],
      createdPaths: []
    });

    expect(pathDiff([], true, false)).to.deep.equal({
      updatedPaths: [[]],
      deletedPaths: [],
      createdPaths: []
    });

    expect(pathDiff([], 1, 2)).to.deep.equal({
      updatedPaths: [[]],
      deletedPaths: [],
      createdPaths: []
    });

    expect(pathDiff([], null, undefined)).to.deep.equal({
      updatedPaths: [[]],
      deletedPaths: [],
      createdPaths: []
    });
  });

  it('diff arrays', () => {
    expect(pathDiff([], [1, 2], [3, 4])).to.deep.equal({
      updatedPaths: [[0], [1]],
      deletedPaths: [],
      createdPaths: []
    });

    expect(pathDiff([], [3], [])).to.deep.equal({
      updatedPaths: [],
      deletedPaths: [[0]],
      createdPaths: []
    });

    expect(pathDiff([], [], [5])).to.deep.equal({
      updatedPaths: [],
      deletedPaths: [],
      createdPaths: [[0]]
    });
  });

  it('diff objects', () => {
    expect(
      pathDiff(
        [],
        {
          a: 1,
          b: 2
        },
        {
          a: 2,
          b: 3
        }
      )
    ).to.deep.equal({
      updatedPaths: [['a'], ['b']],
      deletedPaths: [],
      createdPaths: []
    });

    expect(
      pathDiff(
        [],
        {
          a: 1
        },
        {}
      )
    ).to.deep.equal({
      updatedPaths: [],
      deletedPaths: [['a']],
      createdPaths: []
    });

    expect(
      pathDiff(
        [],
        {},
        {
          a: 1
        }
      )
    ).to.deep.equal({
      updatedPaths: [],
      deletedPaths: [],
      createdPaths: [['a']]
    });

    expect(
      pathDiff(
        [],
        {
          a: {
            b: {
              c: 1
            }
          },
          d: {
            e: 2
          }
        },
        {
          a: {
            b: {
              c: 2
            }
          },
          d: {
            f: 4
          },
          g: {}
        }
      )
    ).to.deep.equal({
      updatedPaths: [['a', 'b', 'c']],
      deletedPaths: [['d', 'e']],
      createdPaths: [['d', 'f'], ['g']]
    });
  });

  it('diff one side nil', () => {
    expect(
      pathDiff(
        [],
        {
          a: null
        },
        {
          a: 1
        }
      )
    ).to.deep.equal({
      updatedPaths: [['a']],
      deletedPaths: [],
      createdPaths: []
    });

    expect(
      pathDiff(
        [],
        {
          a: {
            b: 1
          }
        },
        {
          a: null
        }
      )
    ).to.deep.equal({
      updatedPaths: [['a']],
      deletedPaths: [],
      createdPaths: []
    });
  });

  it('diff immutable list', () => {
    expect(pathDiff([], new List([1, 2]), new List([3, 4]))).to.deep.equal({
      updatedPaths: [[0], [1]],
      deletedPaths: [],
      createdPaths: []
    });

    expect(pathDiff([], new List([3]), new List())).to.deep.equal({
      updatedPaths: [],
      deletedPaths: [[0]],
      createdPaths: []
    });

    expect(pathDiff([], new List(), new List([5]))).to.deep.equal({
      updatedPaths: [],
      deletedPaths: [],
      createdPaths: [[0]]
    });
  });

  it('diff immutable map', () => {
    expect(
      pathDiff(
        [],
        new Map({
          a: 1,
          b: 2
        }),
        new Map({
          a: 2,
          b: 3
        })
      )
    ).to.deep.equal({
      updatedPaths: [['a'], ['b']],
      deletedPaths: [],
      createdPaths: []
    });

    expect(
      pathDiff(
        [],
        new Map({
          a: 1
        }),
        new Map()
      )
    ).to.deep.equal({
      updatedPaths: [],
      deletedPaths: [['a']],
      createdPaths: []
    });

    expect(
      pathDiff(
        [],
        new Map(),
        new Map({
          a: 1
        })
      )
    ).to.deep.equal({
      updatedPaths: [],
      deletedPaths: [],
      createdPaths: [['a']]
    });
  });

  it('diff model', () => {
    class TestModel extends Model {}
    TestModel.defaultProps = {
      a: 1,
      b: 2
    };

    expect(
      pathDiff(
        [],
        new TestModel({
          a: 1,
          b: 2
        }),
        new TestModel({
          a: 2,
          b: 3
        })
      )
    ).to.deep.equal({
      updatedPaths: [['a'], ['b']],
      deletedPaths: [],
      createdPaths: []
    });
  });

  describe('mixture', () => {
    class TestChildModel extends Model {}
    TestChildModel.defaultProps = {
      array: [],
      object: {},
      list: new List(),
      map: new Map()
    };

    class TestModel extends Model {}
    TestModel.defaultProps = {
      child: null,
      array: [],
      object: {},
      list: new List(),
      map: new Map()
    };

    it('same', () => {
      expect(
        pathDiff(
          [],
          new TestModel({
            child: new TestChildModel({
              array: [1, 2, 3],
              object: { a: 1, b: 2, c: 3 },
              list: new List([1, 2, 3]),
              map: new Map({ a: 1, b: 2, c: 3 })
            }),
            array: [1, 2, 3],
            object: { a: 1, b: 2, c: 3 },
            list: new List([1, 2, 3]),
            map: new Map({ a: 1, b: 2, c: 3 })
          }),
          new TestModel({
            child: new TestChildModel({
              array: [1, 2, 3],
              object: { a: 1, b: 2, c: 3 },
              list: new List([1, 2, 3]),
              map: new Map({ a: 1, b: 2, c: 3 })
            }),
            array: [1, 2, 3],
            object: { a: 1, b: 2, c: 3 },
            list: new List([1, 2, 3]),
            map: new Map({ a: 1, b: 2, c: 3 })
          })
        )
      ).to.deep.equal({
        updatedPaths: [],
        deletedPaths: [],
        createdPaths: []
      });
    });

    it('delete', () => {
      expect(
        pathDiff(
          [],
          new TestModel({
            child: new TestChildModel({
              array: [1, 2, 3, 4],
              object: { a: 1, b: 2, c: 3, d: 4 },
              list: new List([1, 2, 3, 4]),
              map: new Map({ a: 1, b: 2, c: 3, d: 4 })
            }),
            array: [1, 2, 3, 4],
            object: { a: 1, b: 2, c: 3, d: 4 },
            list: new List([1, 2, 3, 4]),
            map: new Map({ a: 1, b: 2, c: 3, d: 4 })
          }),
          new TestModel({
            child: new TestChildModel({
              array: [1, 2, 3],
              object: { a: 1, b: 2, c: 3 },
              list: new List([1, 2, 3]),
              map: new Map({ a: 1, b: 2, c: 3 })
            }),
            array: [1, 2, 3],
            object: { a: 1, b: 2, c: 3 },
            list: new List([1, 2, 3]),
            map: new Map({ a: 1, b: 2, c: 3 })
          })
        )
      ).to.deep.equal({
        updatedPaths: [],
        deletedPaths: [
          ['child', 'array', 3],
          ['child', 'object', 'd'],
          ['child', 'list', 3],
          ['child', 'map', 'd'],
          ['array', 3],
          ['object', 'd'],
          ['list', 3],
          ['map', 'd']
        ],
        createdPaths: []
      });
    });

    it('create', () => {
      expect(
        pathDiff(
          [],
          new TestModel({
            child: new TestChildModel({
              array: [1, 2, 3],
              object: { a: 1, b: 2, c: 3 },
              list: new List([1, 2, 3]),
              map: new Map({ a: 1, b: 2, c: 3 })
            }),
            array: [1, 2, 3],
            object: { a: 1, b: 2, c: 3 },
            list: new List([1, 2, 3]),
            map: new Map({ a: 1, b: 2, c: 3 })
          }),
          new TestModel({
            child: new TestChildModel({
              array: [1, 2, 3, 4],
              object: { a: 1, b: 2, c: 3, d: 4 },
              list: new List([1, 2, 3, 4]),
              map: new Map({ a: 1, b: 2, c: 3, d: 4 })
            }),
            array: [1, 2, 3, 4],
            object: { a: 1, b: 2, c: 3, d: 4 },
            list: new List([1, 2, 3, 4]),
            map: new Map({ a: 1, b: 2, c: 3, d: 4 })
          })
        )
      ).to.deep.equal({
        updatedPaths: [],
        deletedPaths: [],
        createdPaths: [
          ['child', 'array', 3],
          ['child', 'object', 'd'],
          ['child', 'list', 3],
          ['child', 'map', 'd'],
          ['array', 3],
          ['object', 'd'],
          ['list', 3],
          ['map', 'd']
        ]
      });
    });

    it('update', () => {
      expect(
        pathDiff(
          [],
          new TestModel({
            child: new TestChildModel({
              array: [1, 2, 3],
              object: { a: 1, b: 2, c: 3 },
              list: new List([1, 2, 3]),
              map: new Map({ a: 1, b: 2, c: 3 })
            }),
            array: [1, 2, 3],
            object: { a: 1, b: 2, c: 3 },
            list: new List([1, 2, 3]),
            map: new Map({ a: 1, b: 2, c: 3 })
          }),
          new TestModel({
            child: new TestChildModel({
              array: [1, 5, 3],
              object: { a: 1, b: 5, c: 3 },
              list: new List([1, 5, 3]),
              map: new Map({ a: 1, b: 5, c: 3 })
            }),
            array: [1, 5, 3],
            object: { a: 1, b: 5, c: 3 },
            list: new List([1, 5, 3]),
            map: new Map({ a: 1, b: 5, c: 3 })
          })
        )
      ).to.deep.equal({
        updatedPaths: [
          ['child', 'array', 1],
          ['child', 'object', 'b'],
          ['child', 'list', 1],
          ['child', 'map', 'b'],
          ['array', 1],
          ['object', 'b'],
          ['list', 1],
          ['map', 'b']
        ],
        deletedPaths: [],
        createdPaths: []
      });
    });
  });
});
