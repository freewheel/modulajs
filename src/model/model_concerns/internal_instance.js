import { isFunction, startsWith, reduce } from 'lodash';
import { Map } from 'immutable';
import Subscription from './subscription';

// only bind sender methods to internalInstance
// bind getter/setter methods feels like a too strong assumption
// and might introduce confusion
export function shouldBind(bindingName) {
  return startsWith(bindingName, 'send');
}

export class InternalInstance {
  constructor(bindings, services, localProps) {
    this.__latestInstance__ = null;
    this.__bindings__ = this.buildBindingMethods(bindings);
    this.__services__ = this.buildServices(services);
    this.__localProps__ = new Map(localProps);
    this.__subscription__ = Subscription();
  }

  hasOwnProperty(key) {
    // don't return __latestInstance__ because it will cause cycle reference
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

  buildBindingMethods(bindings) {
    return reduce(
      bindings,
      (memo, bindingValue, bindingName) => {
        if (isFunction(bindingValue) && shouldBind(bindingName)) {
          return {
            ...memo,
            [bindingName]: (...args) =>
              bindingValue.apply(this.getLatestInstance(), args)
          };
        } else {
          return memo;
        }
      },
      {}
    );
  }

  buildServices(services) {
    return reduce(
      services,
      (memo, createService, serviceName) => ({
        ...memo,
        [serviceName]: createService(() => this.__latestInstance__)
      }),
      {}
    );
  }

  getLocalProps() {
    return this.__localProps__;
  }

  updateLocalProps(props) {
    this.__localProps__ = this.__localProps__.merge(props);
  }

  subscribe(listener) {
    return this.__subscription__.subscribe(listener);
  }

  notifySubscribers() {
    return this.__subscription__.fire();
  }

  getService(name) {
    return this.__services__[name];
  }

  getServices() {
    return this.__services__;
  }
}
