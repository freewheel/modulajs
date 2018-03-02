import { expect } from 'chai';
import sinon from 'sinon';
import { Debug } from '../../../debug';
import { OVERRIDE_METHODS_KEY, OVERRIDE_RECEIVERS_KEY } from '../decorators';
import {
  handleOverrideMethod,
  handleOverrideReceiver
} from '../decorator_handlers';

describe('handleOverrideMethod', () => {
  it('override method', () => {
    const getSomePropBaseStub = sinon.stub().returns('base');
    const baseSpec = { getSomeProp: getSomePropBaseStub };
    const getSomePropExtraStub = sinon.stub().returns('extra');
    const thisChecker = sinon.stub();
    const getSomePropExtra = function getSomePropExtra(baseFunc) {
      return function getSomeProp(arg) {
        thisChecker(this);
        return `${baseFunc(arg)} ${getSomePropExtraStub(arg)}`;
      };
    };
    const extraSpec = {
      [OVERRIDE_METHODS_KEY]: ['getSomeProp'],
      getSomeProp: getSomePropExtra
    };
    const nextStub = sinon.stub();
    const newFunc = handleOverrideMethod(
      baseSpec,
      extraSpec,
      'getSomeProp',
      nextStub
    );

    expect(nextStub.called).to.be.false;
    expect(newFunc).to.be.a('function');
    // Immutability
    expect(baseSpec.getSomeProp).to.equal(getSomePropBaseStub);
    expect(extraSpec.getSomeProp).to.equal(getSomePropExtra);

    const context = { foo: 'bar' };
    const result = newFunc.call(context, 'baz');
    expect(result).to.equal('base extra');
    expect(getSomePropBaseStub.calledOnce).to.be.true;
    expect(getSomePropBaseStub.calledWithExactly('baz')).to.be.true;
    expect(thisChecker.calledOnce).to.be.true;
    expect(thisChecker.calledWithExactly(context)).to.be.true;
    expect(getSomePropExtraStub.calledOnce).to.be.true;
    expect(getSomePropExtraStub.calledWithExactly('baz')).to.be.true;
  });

  it('bypass method without @overrideMethod decorator', () => {
    const getSomePropBaseStub = sinon.stub();
    const baseSpec = { getSomeProp: getSomePropBaseStub };
    const getSomePropExtraStub = sinon.stub();
    const extraSpec = { getSomeProp: getSomePropExtraStub };
    const nextFunc = function nextFunc() {};
    const nextStub = sinon.stub().returns(nextFunc);
    const newFunc = handleOverrideMethod(
      baseSpec,
      extraSpec,
      'getSomeProp',
      nextStub
    );

    expect(nextStub.called).to.be.true;
    expect(newFunc).to.be.a('function');
    expect(newFunc).to.equal(nextFunc);
    // Immutability
    expect(baseSpec.getSomeProp).to.equal(getSomePropBaseStub);
    expect(extraSpec.getSomeProp).to.equal(getSomePropExtraStub);
  });

  describe('handleOverrideMethod validations', () => {
    const extraSpec = {
      [OVERRIDE_METHODS_KEY]: ['getSomeProp'],
      getSomeProp() {
        return function getSomeProp() {};
      }
    };
    const nextStub = sinon.stub();

    it('override method validations all pass', () => {
      const baseSpec = {
        displayName: 'BaseModel',
        getSomeProp() {}
      };
      const extraSpecNotFunc = {
        [OVERRIDE_METHODS_KEY]: ['getSomeProp'],
        getSomeProp(baseGetSomeProp) {
          return baseGetSomeProp;
        }
      };

      Debug.enable();
      expect(() => {
        const newFunc = handleOverrideMethod(
          baseSpec,
          extraSpecNotFunc,
          'getSomeProp',
          nextStub
        );
        newFunc();
      }).to.not.throw();
      Debug.disable();
    });

    it('override method without base model', () => {
      Debug.enable();
      expect(() => {
        handleOverrideMethod(null, extraSpec, 'getSomeProp', nextStub);
      }).to.throw(
        "Error overriding base model's extraBindings: base model is missing"
      );
      Debug.disable();
    });

    it('override method without base method', () => {
      const baseSpec = {
        displayName: 'BaseModel',
        getOtherProp() {}
      };

      Debug.enable();
      expect(() => {
        handleOverrideMethod(baseSpec, extraSpec, 'getSomeProp', nextStub);
      }).to.throw(
        "Error overriding BaseModel's extraBindings: getSomeProp is missing in base model"
      );
      Debug.disable();
    });

    it('override method but base method is not a function', () => {
      const baseSpec = {
        displayName: 'BaseModel',
        getSomeProp: 'not function'
      };

      Debug.enable();
      expect(() => {
        handleOverrideMethod(baseSpec, extraSpec, 'getSomeProp', nextStub);
      }).to.throw(
        "Error overriding BaseModel's extraBindings: getSomeProp is not a function in base model"
      );
      Debug.disable();
    });

    it('override method but extra method is not a function', () => {
      const baseSpec = {
        displayName: 'BaseModel',
        getSomeProp() {}
      };
      const extraSpecNotFunc = {
        [OVERRIDE_METHODS_KEY]: ['getSomeProp'],
        getSomeProp: 'not function'
      };

      Debug.enable();
      expect(() => {
        handleOverrideMethod(
          baseSpec,
          extraSpecNotFunc,
          'getSomeProp',
          nextStub
        );
      }).to.throw(
        "Error overriding BaseModel's extraBindings: getSomeProp is not a function"
      );
      Debug.disable();
    });

    it('override method but extra method does not return a function', () => {
      const baseSpec = {
        displayName: 'BaseModel',
        getSomeProp() {}
      };
      const extraSpecNotFunc = {
        [OVERRIDE_METHODS_KEY]: ['getSomeProp'],
        getSomeProp() {
          return {};
        }
      };

      Debug.enable();
      let newFunc;
      expect(() => {
        newFunc = handleOverrideMethod(
          baseSpec,
          extraSpecNotFunc,
          'getSomeProp',
          nextStub
        );
      }).to.not.throw();
      expect(() => {
        newFunc();
      }).to.throw(
        "Error overriding BaseModel's extraBindings: getSomeProp doesn't return a function as expected"
      );
      Debug.disable();
    });
  });
});

describe('handleOverrideReceiver', () => {
  it('override receiver', () => {
    const newModel = { prop: 'newValue' };
    const recvSomeActionUpdateBaseStub = sinon.stub().returns([newModel]);
    const recvSomeActionBaseStub = sinon.stub().returns({
      type: 'ACTION',
      update: recvSomeActionUpdateBaseStub
    });
    const baseSpec = { recvSomeAction: recvSomeActionBaseStub };
    const newModel2 = { prop: 'newValue2' };
    const recvSomeActionUpdateExtraStub = sinon.stub().returns([newModel2]);
    const recvSomeActionExtra = function recvSomeActionExtra(baseUpdate) {
      return function update(model, action) {
        return recvSomeActionUpdateExtraStub(baseUpdate(model, action));
      };
    };
    const extraSpec = {
      [OVERRIDE_RECEIVERS_KEY]: ['recvSomeAction'],
      recvSomeAction: recvSomeActionExtra
    };
    const nextStub = sinon.stub();
    const newFunc = handleOverrideReceiver(
      baseSpec,
      extraSpec,
      'recvSomeAction',
      nextStub
    );

    expect(nextStub.called).to.be.false;
    expect(newFunc).to.be.a('function');
    // Immutability
    expect(baseSpec.recvSomeAction).to.equal(recvSomeActionBaseStub);
    expect(extraSpec.recvSomeAction).to.equal(recvSomeActionExtra);

    const { type, update } = newFunc();
    expect(type).to.equal('ACTION');
    expect(update).to.be.a('function');
    expect(recvSomeActionBaseStub.calledOnce).to.be.true;

    const oldModel = { prop: 'oldValue' };
    const action = { type: 'ACTION' };
    const result = update(oldModel, action);
    expect(recvSomeActionUpdateBaseStub.calledOnce).to.be.true;
    expect(recvSomeActionUpdateBaseStub.calledWithExactly(oldModel, action)).to
      .be.true;
    expect(recvSomeActionUpdateExtraStub.calledOnce).to.be.true;
    expect(recvSomeActionUpdateExtraStub.calledWithExactly([newModel])).to.be
      .true;
    expect(result).to.deep.equal([newModel2]);
  });

  it('bypass receiver without @overrideReceiver decorator', () => {
    const recvSomeActionBaseStub = sinon.stub();
    const baseSpec = { recvSomeAction: recvSomeActionBaseStub };
    const recvSomeActionExtraStub = sinon.stub();
    const extraSpec = { recvSomeAction: recvSomeActionExtraStub };
    const nextFunc = function nextFunc() {};
    const nextStub = sinon.stub().returns(nextFunc);
    const newFunc = handleOverrideReceiver(
      baseSpec,
      extraSpec,
      'recvSomeAction',
      nextStub
    );

    expect(nextStub.called).to.be.true;
    expect(newFunc).to.be.a('function');
    expect(newFunc).to.equal(nextFunc);
    // Immutability
    expect(baseSpec.recvSomeAction).to.equal(recvSomeActionBaseStub);
    expect(extraSpec.recvSomeAction).to.equal(recvSomeActionExtraStub);
  });

  describe('handleOverrideReceiver validations', () => {
    const extraSpec = {
      [OVERRIDE_RECEIVERS_KEY]: ['recvSomeAction'],
      recvSomeAction() {
        return function update() {};
      }
    };
    const nextStub = sinon.stub();

    it('override receiver validations all pass', () => {
      const baseSpec = {
        displayName: 'BaseModel',
        recvSomeAction() {
          return {
            type: 'ACTION',
            update() {}
          };
        }
      };

      Debug.enable();
      let newFunc;
      let result;
      expect(() => {
        newFunc = handleOverrideReceiver(
          baseSpec,
          extraSpec,
          'recvSomeAction',
          nextStub
        );
      }).to.not.throw();
      expect(() => {
        result = newFunc();
      }).to.not.throw();
      const { update } = result;
      expect(() => {
        update();
      }).to.not.throw();
      Debug.disable();
    });

    it('override receiver without base model', () => {
      Debug.enable();
      expect(() => {
        handleOverrideReceiver(null, extraSpec, 'recvSomeAction', nextStub);
      }).to.throw(
        "Error overriding base model's extraBindings: base model is missing"
      );
      Debug.disable();
    });

    it('override receiver without base method', () => {
      const baseSpec = {
        displayName: 'BaseModel',
        recvOtherAction() {}
      };

      Debug.enable();
      expect(() => {
        handleOverrideReceiver(baseSpec, extraSpec, 'recvSomeAction', nextStub);
      }).to.throw(
        "Error overriding BaseModel's extraBindings: recvSomeAction is missing in base model"
      );
      Debug.disable();
    });

    it('override receiver but base method is not a function', () => {
      const baseSpec = {
        displayName: 'BaseModel',
        recvSomeAction: 'not function'
      };

      Debug.enable();
      expect(() => {
        handleOverrideReceiver(baseSpec, extraSpec, 'recvSomeAction', nextStub);
      }).to.throw(
        "Error overriding BaseModel's extraBindings: recvSomeAction is not a function in base model"
      );
      Debug.disable();
    });

    it('override receiver but extra method is not a function', () => {
      const baseSpec = {
        displayName: 'BaseModel',
        recvSomeAction() {}
      };
      const extraSpecNotFunc = {
        [OVERRIDE_RECEIVERS_KEY]: ['recvSomeAction'],
        recvSomeAction: 'not function'
      };

      Debug.enable();
      expect(() => {
        handleOverrideReceiver(
          baseSpec,
          extraSpecNotFunc,
          'recvSomeAction',
          nextStub
        );
      }).to.throw(
        "Error overriding BaseModel's extraBindings: recvSomeAction is not a function"
      );
      Debug.disable();
    });

    it('override receiver but base method is not valid receiver', () => {
      const recvSomeActionBaseStub = sinon.stub().returns({ update: {} });
      const baseSpec = {
        displayName: 'BaseModel',
        recvSomeAction: recvSomeActionBaseStub
      };
      const newFunc = handleOverrideReceiver(
        baseSpec,
        extraSpec,
        'recvSomeAction',
        nextStub
      );

      Debug.enable();
      expect(() => newFunc()).to.throw(
        "Error overriding BaseModel's extraBindings: recvSomeAction is not a valid reaction in base model"
      );
      Debug.disable();
    });
  });
});
