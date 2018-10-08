import { expect } from 'chai';
import Trie from '../trie';

describe('Trie', () => {
  it('init', () => {
    const t = new Trie();

    expect(t.tree).to.deep.equal({
      children: {},
      values: []
    });
  });

  it('add', () => {
    const t = new Trie();

    t.add(['a', 'b'], 'vvv');

    expect(t.tree).to.deep.equal({
      children: {
        a: {
          children: {
            b: {
              children: {},
              values: ['vvv']
            }
          },
          values: []
        }
      },
      values: []
    });

    t.add(['a', 'b'], 'zzz');

    expect(t.tree).to.deep.equal({
      children: {
        a: {
          children: {
            b: {
              children: {},
              values: ['vvv', 'zzz']
            }
          },
          values: []
        }
      },
      values: []
    });

    t.add(['a', 'c'], 'ggg');

    expect(t.tree).to.deep.equal({
      children: {
        a: {
          children: {
            b: {
              children: {},
              values: ['vvv', 'zzz']
            },
            c: {
              children: {},
              values: ['ggg']
            }
          },
          values: []
        }
      },
      values: []
    });
  });

  it('remove', () => {
    const t = new Trie();

    t.add(['a', 'b'], 'vvv');
    t.add(['a', 'b'], 'zzz');
    t.add(['a', 'c'], 'ggg');

    expect(t.tree).to.deep.equal({
      children: {
        a: {
          children: {
            b: {
              children: {},
              values: ['vvv', 'zzz']
            },
            c: {
              children: {},
              values: ['ggg']
            }
          },
          values: []
        }
      },
      values: []
    });

    t.remove(['a', 'b'], 'vvv');

    expect(t.tree).to.deep.equal({
      children: {
        a: {
          children: {
            b: {
              children: {},
              values: ['zzz']
            },
            c: {
              children: {},
              values: ['ggg']
            }
          },
          values: []
        }
      },
      values: []
    });

    t.remove(['a', 'b'], 'zzz');

    expect(t.tree).to.deep.equal({
      children: {
        a: {
          children: {
            c: {
              children: {},
              values: ['ggg']
            }
          },
          values: []
        }
      },
      values: []
    });

    t.remove(['a', 'c'], 'ggg');

    expect(t.tree).to.deep.equal({
      children: {},
      values: []
    });
  });

  it('remove throws error when path or item missing', () => {
    const t = new Trie();
    t.add(['a'], 'aaa');

    expect(() => {
      t.remove(['b'], 'aaa');
    }).to.throw(/Cannot find given item at given path/);

    expect(() => {
      t.remove(['a'], 'bbb');
    }).to.throw(/Cannot find given item at given path/);
  });

  it('at', () => {
    const t = new Trie();

    t.add(['a', 'b'], 'vvv');

    expect(t.at(['a'])).to.deep.equal({
      children: {
        b: {
          children: {},
          values: ['vvv']
        }
      },
      values: []
    });
    expect(t.at(['a', 'b'])).to.deep.equal({
      children: {},
      values: ['vvv']
    });
  });

  it('has', () => {
    const t = new Trie();

    t.add(['a', 'b'], 'vvv');

    expect(t.has(['a'])).to.be.true;
    expect(t.has(['a', 'b'])).to.be.true;
  });

  it('getValues', () => {
    const t = new Trie();

    t.add(['a', 'b'], 'vvv');

    expect(t.getValues(['a', 'b'])).to.deep.equal(['vvv']);
  });

  it('valuesInPath', () => {
    const t = new Trie();

    t.add(['a'], 'xxx');
    t.add(['a', 'b'], 'yyy');
    t.add(['a', 'c'], 'zzz');
    t.add(['a', 'c'], 'zzzz');

    expect(t.valuesInPath(['a'])).to.deep.equal([
      { path: ['a'], value: 'xxx' }
    ]);
    expect(t.valuesInPath(['a', 'b'])).to.deep.equal([
      { path: ['a'], value: 'xxx' },
      { path: ['a', 'b'], value: 'yyy' }
    ]);
    expect(t.valuesInPath(['a', 'b', 'c'])).to.deep.equal([
      { path: ['a'], value: 'xxx' },
      { path: ['a', 'b'], value: 'yyy' }
    ]);
    expect(t.valuesInPath(['a', 'b', 'c', 'd'])).to.deep.equal([
      { path: ['a'], value: 'xxx' },
      { path: ['a', 'b'], value: 'yyy' }
    ]);

    expect(t.valuesInPath(['a', 'c'])).to.deep.equal([
      { path: ['a'], value: 'xxx' },
      { path: ['a', 'c'], value: 'zzz' },
      { path: ['a', 'c'], value: 'zzzz' }
    ]);

    expect(t.valuesInPath(['b'])).to.deep.equal([]);
  });
});
