import { expect } from 'chai';
import sinon from 'sinon';
import PropTypes from 'prop-types';
import { Debug } from '../../../debug';
import { createTreeModel } from '../../tree_model';
import extendModel, {
  invoke,
  createMetaHandler,
  createFunctionHandler,
  handleDefaults,
  handleDisplayName,
  handleOtherBinding
} from '../extend_model';

describe('invoke', () => {
  it('should invoke next', () => {
    const handler1 = sinon
      .stub()
      .callsFake((baseSpec, extraSpec, key, next) => next());
    const handler2 = sinon
      .stub()
      .callsFake((baseSpec, extraSpec, key, next) => next());
    const handler3 = sinon.stub().callsFake(() => 'bar');
    const handlers = [handler1, handler2, handler3];
    const baseSpec = {};
    const extraSpec = {};
    const key = 'key';
    const result = invoke(baseSpec, extraSpec, key, handlers);

    expect(handler1.calledOnce).to.be.true;
    expect(handler1.calledWith(baseSpec, extraSpec, key)).to.be.true;
    expect(handler2.calledOnce).to.be.true;
    expect(handler2.calledWith(baseSpec, extraSpec, key)).to.be.true;
    expect(handler3.calledOnce).to.be.true;
    expect(handler3.calledWith(baseSpec, extraSpec, key)).to.be.true;
    expect(result).to.equal('bar');
  });

  it('should stop invoking next if not specified', () => {
    const handler1 = sinon
      .stub()
      .callsFake((baseSpec, extraSpec, key, next) => next());
    const handler2 = sinon.stub().callsFake(() => 'foo');
    const handler3 = sinon.stub().callsFake(() => 'bar');
    const handlers = [handler1, handler2, handler3];
    const baseSpec = {};
    const extraSpec = {};
    const key = 'key';
    const result = invoke(baseSpec, extraSpec, key, handlers);

    expect(handler1.calledOnce).to.be.true;
    expect(handler1.calledWith(baseSpec, extraSpec, key)).to.be.true;
    expect(handler2.calledOnce).to.be.true;
    expect(handler2.calledWith(baseSpec, extraSpec, key)).to.be.true;
    expect(handler3.called).to.be.false;
    expect(result).to.equal('foo');
  });
});

describe('handleMeta', () => {
  it('merge meta', () => {
    const handleMeta = createMetaHandler('myMeta');
    const baseSpec = { myMeta: { foo: 1, bar: 2 } };
    const extraSpec = { myMeta: { baz: 3, qux: 4 } };
    const key = 'myMeta';
    const next = sinon.stub();

    const newMeta = handleMeta(baseSpec, extraSpec, key, next);
    expect(next.called).to.be.false;
    expect(baseSpec).to.deep.equal({ myMeta: { foo: 1, bar: 2 } });
    expect(extraSpec).to.deep.equal({ myMeta: { baz: 3, qux: 4 } });
    expect(newMeta).to.deep.equal({ foo: 1, bar: 2, baz: 3, qux: 4 });
  });

  it('merge meta without base meta', () => {
    const handleMeta = createMetaHandler('myMeta');
    const baseSpec = {};
    const extraSpec = { myMeta: { baz: 3, qux: 4 } };
    const key = 'myMeta';
    const next = sinon.stub();

    const newMeta = handleMeta(baseSpec, extraSpec, key, next);
    expect(next.called).to.be.false;
    expect(extraSpec).to.deep.equal({ myMeta: { baz: 3, qux: 4 } });
    expect(newMeta).to.deep.equal({ baz: 3, qux: 4 });
  });

  it('merge meta without extra meta', () => {
    const handleMeta = createMetaHandler('myMeta');
    const baseSpec = { myMeta: { foo: 1, bar: 2 } };
    const extraSpec = {};
    const key = 'myMeta';
    const next = sinon.stub();

    const newMeta = handleMeta(baseSpec, extraSpec, key, next);
    expect(next.called).to.be.false;
    expect(baseSpec).to.deep.equal({ myMeta: { foo: 1, bar: 2 } });
    expect(newMeta).to.deep.equal({ foo: 1, bar: 2 });
  });

  it('should throw error when trying to override', () => {
    const handleMeta = createMetaHandler('myMeta');
    const baseSpec = { myMeta: { foo: 1, bar: 2 }, displayName: 'BaseModel' };
    const extraSpec = { myMeta: { bar: 3 } };
    const key = 'myMeta';
    const next = sinon.stub();

    Debug.enable();
    expect(() => {
      handleMeta(baseSpec, extraSpec, key, next);
    }).to.throw(
      'Error extending BaseModel\'s myMeta: bar already exists in base model, do not override'
    );
    Debug.disable();
  });

  it('should invoke next if not match key', () => {
    const handleMeta = createMetaHandler('notMyMeta');
    const baseSpec = { myMeta: { foo: 1, bar: 2 } };
    const extraSpec = { myMeta: { baz: 3, qux: 4 } };
    const key = 'myMeta';
    const next = sinon.stub();

    handleMeta(baseSpec, extraSpec, key, next);
    expect(next.called).to.be.true;
  });
});

describe('handleFunction', () => {
  it('merge function', () => {
    const handleFunction = createFunctionHandler('myFunc');
    const baseFuncThisChecker = sinon.stub();
    const baseFuncStub = sinon.stub().callsFake(function myFunc() {
      baseFuncThisChecker(this);
      return { foo: 1 };
    });
    const baseSpec = { myFunc: baseFuncStub };
    const extraFuncThisChecker = sinon.stub();
    const extraFuncStub = sinon.stub().callsFake(function myFunc() {
      extraFuncThisChecker(this);
      return { bar: 2 };
    });
    const extraSpec = { myFunc: extraFuncStub };
    const key = 'myFunc';
    const next = sinon.stub();

    const newFunc = handleFunction(baseSpec, extraSpec, key, next);
    expect(next.called).to.be.false;
    expect(newFunc).to.be.a('function');

    const context = { qux: 1 };
    const result = newFunc.call(context, 'baz');
    expect(baseFuncStub.calledOnce).to.be.true;
    expect(baseFuncStub.calledWithExactly('baz')).to.be.true;
    expect(baseFuncThisChecker.calledWithExactly(context)).to.be.true;
    expect(extraFuncStub.calledOnce).to.be.true;
    expect(extraFuncStub.calledWithExactly('baz')).to.be.true;
    expect(extraFuncThisChecker.calledWithExactly(context)).to.be.true;
    expect(result).to.deep.equal({ foo: 1, bar: 2 });
  });

  it('merge function without base function', () => {
    const handleFunction = createFunctionHandler('myFunc');
    const baseSpec = {};
    const extraFuncThisChecker = sinon.stub();
    const extraFuncStub = sinon.stub().callsFake(function myFunc() {
      extraFuncThisChecker(this);
      return { bar: 2 };
    });
    const extraSpec = { myFunc: extraFuncStub };
    const key = 'myFunc';
    const next = sinon.stub();

    const newFunc = handleFunction(baseSpec, extraSpec, key, next);
    expect(next.called).to.be.false;
    expect(newFunc).to.be.a('function');

    const context = { qux: 1 };
    const result = newFunc.call(context, 'baz');
    expect(extraFuncStub.calledOnce).to.be.true;
    expect(extraFuncStub.calledWithExactly('baz')).to.be.true;
    expect(extraFuncThisChecker.calledWithExactly(context)).to.be.true;
    expect(result).to.deep.equal({ bar: 2 });
  });

  it('merge function without extra function', () => {
    const handleFunction = createFunctionHandler('myFunc');
    const baseFuncThisChecker = sinon.stub();
    const baseFuncStub = sinon.stub().callsFake(function myFunc() {
      baseFuncThisChecker(this);
      return { foo: 1 };
    });
    const baseSpec = { myFunc: baseFuncStub };
    const extraSpec = {};
    const key = 'myFunc';
    const next = sinon.stub();

    const newFunc = handleFunction(baseSpec, extraSpec, key, next);
    expect(next.called).to.be.false;
    expect(newFunc).to.be.a('function');

    const context = { qux: 1 };
    const result = newFunc.call(context, 'baz');
    expect(baseFuncStub.calledOnce).to.be.true;
    expect(baseFuncStub.calledWithExactly('baz')).to.be.true;
    expect(baseFuncThisChecker.calledWithExactly(context)).to.be.true;
    expect(result).to.deep.equal({ foo: 1 });
  });

  it('merge function without both functions', () => {
    // Actually this case never happens
    const handleFunction = createFunctionHandler('myFunc');
    const baseSpec = {};
    const extraSpec = {};
    const key = 'myFunc';
    const next = sinon.stub();

    const newFunc = handleFunction(baseSpec, extraSpec, key, next);
    expect(next.called).to.be.false;
    expect(newFunc).to.be.null;
  });

  it('should throw error when trying to override in return value', () => {
    const handleFunction = createFunctionHandler('myFunc');
    const baseFuncStub = sinon.stub().returns({ foo: 1 });
    const baseSpec = { myFunc: baseFuncStub, displayName: 'BaseModel' };
    const extraFuncStub = sinon.stub().returns({ foo: 2 });
    const extraSpec = { myFunc: extraFuncStub };
    const key = 'myFunc';
    const next = sinon.stub();

    const newFunc = handleFunction(baseSpec, extraSpec, key, next);
    expect(next.called).to.be.false;
    expect(newFunc).to.be.a('function');

    Debug.enable();
    expect(() => {
      newFunc();
    }).to.throw(
      'Error extending BaseModel\'s myFunc: foo already exists in base model, do not override'
    );
    Debug.disable();
  });

  it('should invoke next if not match key', () => {
    const handleFunction = createFunctionHandler('notMyMeta');
    const baseSpec = { myFunc: () => {} };
    const extraSpec = { myFunc: () => {} };
    const key = 'myFunc';
    const next = sinon.stub();

    handleFunction(baseSpec, extraSpec, key, next);
    expect(next.called).to.be.true;
  });
});

describe('handleDefaults', () => {
  it('merge defaults', () => {
    const baseSpec = { defaults: { foo: 1 } };
    const extraSpec = { defaults: { bar: 2 } };
    const key = 'defaults';
    const next = sinon.stub();
    const newDefaults = handleDefaults(baseSpec, extraSpec, key, next);

    expect(next.called).to.be.false;
    expect(newDefaults).to.deep.equal({ foo: 1, bar: 2 });
  });

  it('should throw error if defaults is a single function', () => {
    const baseSpec = { defaults: () => {}, displayName: 'BaseModel' };
    const extraSpec = { defaults: { foo: 1 } };
    const key = 'defaults';
    const next = sinon.stub();

    Debug.enable();
    expect(() => {
      handleDefaults(baseSpec, extraSpec, key, next);
    }).to.throw(
      'Error extending BaseModel\'s defaults: overriding functional defaults in base model is not supported yet'
    );
    Debug.disable();

    // A fallback when Debug disabled
    const newDefaults = handleDefaults(baseSpec, extraSpec, key, next);
    expect(newDefaults).to.be.a('function');
  });
});

describe('handleDisplayName', () => {
  it('override displayName', () => {
    const baseSpec = { displayName: 'Foo' };
    const extraSpec = { displayName: 'Bar' };
    const key = 'displayName';
    const next = sinon.stub();
    const newDisplayName = handleDisplayName(baseSpec, extraSpec, key, next);

    expect(next.called).to.be.false;
    expect(newDisplayName).to.equal('Bar');
  });

  it('auto set displayName', () => {
    const baseSpec = { displayName: 'Foo' };
    const extraSpec = {};
    const key = 'displayName';
    const next = sinon.stub();
    const newDisplayName = handleDisplayName(baseSpec, extraSpec, key, next);

    expect(next.called).to.be.false;
    expect(newDisplayName).to.equal('extend(Foo)');
  });
});

describe('handleOtherBinding', () => {
  it('merge other binding', () => {
    const baseSpec = {};
    const extraSpec = { foo: 'bar' };
    const key = 'foo';
    const newBinding = handleOtherBinding(baseSpec, extraSpec, key);

    expect(newBinding).to.equal('bar');
  });

  it('should throw error if trying to override', () => {
    const baseSpec = { foo: 'bar', displayName: 'BaseModel' };
    const extraSpec = { foo: 'baz' };
    const key = 'foo';

    Debug.enable();
    expect(() => {
      handleOtherBinding(baseSpec, extraSpec, key);
    }).to.throw(
      'Error extending BaseModel\'s extraBindings: foo already exists in base model, do not override unless using @overrideMethod or @overrideReceiver'
    );
    Debug.disable();
  });
});

describe('extendModel', () => {
  it('get from enhanced model', () => {
    const Model = createTreeModel({
      propTypes: { name: PropTypes.string },
      defaults: { name: null }
    });
    const EnhancedModel = extendModel({
      propTypes: { age: PropTypes.number },
      defaults: { age: 0 }
    })(Model);
    const m1 = new EnhancedModel({ name: 'hello', age: 26 });

    expect(m1.get('name')).to.equal('hello');
    expect(m1.get('age')).to.equal(26);
  });

  it('set to enhanced model', () => {
    const Model = createTreeModel({
      propTypes: { name: PropTypes.string },
      defaults: { name: null }
    });
    const EnhancedModel = extendModel({
      propTypes: { age: PropTypes.number },
      defaults: { age: 0 }
    })(Model);
    const m1 = new EnhancedModel({ name: 'hello', age: 26 });
    const m2 = m1.setMulti({ name: 'bar', age: 33 });

    expect(m2.get('name')).to.equal('bar');
    expect(m2.get('age')).to.equal(33);
  });

  it('with no base model', () => {
    const EnhancedModel = extendModel({
      propTypes: { age: PropTypes.number },
      defaults: { age: 0 }
    })();
    const m1 = new EnhancedModel({ age: 26 });
    expect(m1.get('age')).to.equal(26);
  });

  it('by overriding existing meta', () => {
    Debug.enable();

    const Model = createTreeModel({
      propTypes: { name: PropTypes.string }
    });
    const enhancer = extendModel({
      propTypes: { name: PropTypes.number }
    });
    expect(() => enhancer(Model)).to.throw(
      'Error extending <<anonymous TreeModel>>\'s propTypes: name already exists in base model, do not override'
    );

    Debug.disable();
  });

  it('extended model is subclass of base model', () => {
    const Model = createTreeModel({
      propTypes: { name: PropTypes.string },
      defaults: { name: null }
    });
    const EnhancedModel = extendModel({
      propTypes: { age: PropTypes.number },
      defaults: { age: 0 }
    })(Model);
    const m1 = new EnhancedModel({ name: 'hello', age: 26 });

    expect(m1).to.be.instanceOf(EnhancedModel);
    expect(m1).to.be.instanceOf(Model);
  });
});
