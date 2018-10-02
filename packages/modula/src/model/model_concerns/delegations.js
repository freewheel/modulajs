import { toPairs, forEach } from 'ramda';

function createSetMethod(model, child, method) {
  return function modelSetter(...args) {
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

function createGetMethod(model, child, method, ifNotExist) {
  return function modelGetter(...args) {
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

export default function createDelegateMethods(model, delegates) {
  forEach(([child, childDelegates]) => {
    forEach(({ method, as, set, ifNotExist }) => {
      const methodName = as || method;

      if (set) {
        model[methodName] = createSetMethod(model, child, method);
      } else {
        model[methodName] = createGetMethod(model, child, method, ifNotExist);
      }
    }, childDelegates);
  }, toPairs(delegates));
}
