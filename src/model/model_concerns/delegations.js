import { forEach } from 'lodash';

function createSetMethod(model, child, method, methodName) {
  model[methodName] = function modelSetter(...args) {
    const originalChild = model.get(child);

    if (originalChild) {
      const methodOnChild = originalChild[method];
      const newChild = methodOnChild.apply(originalChild, args);

      if (newChild !== originalChild) {
        return model.set(child, newChild);
      } else {
        return model;
      }
    } else {
      throw new Error('calling child method before it exists');
    }
  };
}

function createGetMethod(model, child, method, methodName, ifNotExist) {
  model[methodName] = function modelGetter(...args) {
    const childModel = model.get(child);
    if (childModel) {
      const methodOnChild = childModel[method];

      return methodOnChild.apply(childModel, args);
    } else if (ifNotExist !== undefined) {
      return ifNotExist;
    } else {
      throw new Error('calling child method before it exists');
    }
  };
}

export function createDelegateMethods(model, delegates) {
  forEach(delegates, (childDelegates, child) => {
    forEach(childDelegates, delegate => {
      const { method, as, set, ifNotExist } = delegate;
      const methodName = as || method;

      if (set) {
        createSetMethod(model, child, method, methodName);
      } else {
        createGetMethod(model, child, method, methodName, ifNotExist);
      }
    });
  });
}
