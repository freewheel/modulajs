import { is, startsWith, reduce, toPairs, forEach } from 'ramda';
import { getAllFunctions } from './inheritance';

// only bind sender methods to internalInstance
// bind getter/setter methods feels like a too strong assumption
// and might introduce confusion
export const shouldBind = startsWith('send');

export class InternalInstance {
  constructor(bindings, services) {
    this.__latestInstance__ = null;
    this.__bindings__ = this.buildBindingMethods(bindings);
    this.__services__ = this.buildServices(services);
  }

  // eslint-disable-next-line class-methods-use-this
  hasOwnProperty(key) {
    // don't return __latestInstance__ since it will cause cycle reference
    return key === '__bindings__' || key === '__services__';
  }

  setLatestInstance(instance) {
    this.__latestInstance__ = instance;
    return this;
  }

  getLatestInstance() {
    return this.__latestInstance__;
  }

  hasBinding(name) {
    return this.__bindings__[name] !== undefined;
  }

  getBinding(name) {
    return this.__bindings__[name];
  }

  getBindings() {
    return this.__bindings__;
  }

  buildBindingMethods(bindings) {
    return reduce(
      (memo, [bindingName, bindingValue]) => {
        if (is(Function, bindingValue) && shouldBind(bindingName)) {
          return {
            ...memo,
            [bindingName]: (...args) =>
              bindingValue.apply(this.getLatestInstance(), args)
          };
        } else {
          return memo;
        }
      },
      {},
      toPairs(bindings)
    );
  }

  buildServices(services) {
    return reduce(
      (memo, [serviceName, createService]) => ({
        ...memo,
        [serviceName]: createService(() => this.__latestInstance__)
      }),
      {},
      toPairs(services)
    );
  }

  getService(name) {
    return this.__services__[name];
  }

  getServices() {
    return this.__services__;
  }
}

export function setAsLatestInstance(model) {
  model.__internalInstance__.setLatestInstance(model);
}

export function setInternalInstance(model, internalInstance) {
  if (!internalInstance) {
    // set internal instance as early as possible
    model.__internalInstance__ = new InternalInstance(
      getAllFunctions(model),
      model.constructor.services
    ).setLatestInstance(model);
  } else {
    model.__internalInstance__ = internalInstance;
  }
}

export function inheritMethodsFromInternalInstance(model) {
  forEach(([name, value]) => {
    model[name] = value;
  }, toPairs(model.__internalInstance__.getBindings()));
}
