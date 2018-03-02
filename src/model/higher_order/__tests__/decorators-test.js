import { expect } from 'chai';
import {
  OVERRIDE_METHODS_KEY,
  OVERRIDE_RECEIVERS_KEY,
  overrideMethod,
  overrideReceiver
} from '../decorators';

describe('overrideMethod', () => {
  it('override method', () => {
    const spec = {
      myFunc1() {},

      @overrideMethod myFunc2() {},

      @overrideMethod myFunc3() {}
    };

    expect(spec[OVERRIDE_METHODS_KEY]).to.exist;
    expect(spec[OVERRIDE_METHODS_KEY]).to.not.contain('myFunc1');
    expect(spec[OVERRIDE_METHODS_KEY]).to.contain('myFunc2');
    expect(spec[OVERRIDE_METHODS_KEY]).to.contain('myFunc3');
  });
});

describe('overrideReceiver', () => {
  it('override receiver', () => {
    const spec = {
      recvAction1() {},

      @overrideReceiver recvAction2() {},

      @overrideReceiver recvAction3() {}
    };

    expect(spec[OVERRIDE_RECEIVERS_KEY]).to.exist;
    expect(spec[OVERRIDE_RECEIVERS_KEY]).to.not.contain('recvAction1');
    expect(spec[OVERRIDE_RECEIVERS_KEY]).to.contain('recvAction2');
    expect(spec[OVERRIDE_RECEIVERS_KEY]).to.contain('recvAction3');
  });
});
