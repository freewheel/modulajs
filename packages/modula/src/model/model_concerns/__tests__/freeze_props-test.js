import { expect } from 'chai';
import { List } from 'immutable';
import freezeProps from '../freeze_props';
import { Model } from '../..';

describe('freeze props', () => {
  it('throws when modified for simple object', () => {
    const obj = { a: 1, b: 2 };
    freezeProps(obj);

    expect(() => {
      obj.a = 2;
    }).to.throw;
  });

  it('throws when modified for object with array attr', () => {
    const obj = { a: 1, b: [2, 3] };
    freezeProps(obj);

    expect(() => {
      obj.b.push(4);
    }).to.throw;

    expect(() => {
      obj.b[0] = 4;
    }).to.throw;
  });

  it('throws when modified for deep nesting', () => {
    const obj = {
      a: {
        c: 1
      },
      b: {
        d: [2, 3]
      },
      e: [{ f: 1 }, { g: 2 }]
    };
    freezeProps(obj);

    expect(() => {
      obj.a.c = 2;
    }).to.throw;

    expect(() => {
      obj.b.d.push(1);
    }).to.throw;

    expect(() => {
      obj.e.f = 2;
    }).to.throw;
  });

  it('does not concern about model', () => {
    const obj = {
      model: new Model()
    };

    freezeProps(obj);

    expect(() => {
      obj.model.f = 2;
    }).to.not.throw;
  });

  it('does not concern about immutable', () => {
    const obj = {
      list: new List()
    };

    freezeProps(obj);

    expect(() => {
      obj.list.f = 2;
    }).to.not.throw;
  });
});
