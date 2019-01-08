## What is Side Effect

According to the [Wikipedia](https://en.wikipedia.org/wiki/Side_effect_(computer_science)):

> A function is said to have a **side effect** if it modifies some state or has an observable interaction with calling functions or the outside world. For example, a particular function might modify a global variable or static variable, modify one of its arguments, ... or call other side-effecting functions.

In UI front end area, a side effect could be more macroscopic. Think of a typical case: a parent component completes loading data, and then its child component begins to load automatically. The child component's loading can be treated as a Side Effect.

## Handle Side Effects with ModulaJS

Let's look into the typical case in last section. Considering component modularity, it's definitely not a good idea to write the logic of loading data for the child component inside the parent.

In [Model](#docs-model) chapter, when explaining Sender and Receiver, we mentioned the return value of a Receiver function contains a `update()` function, which finally returns an array. The members other than the first one of the array are functions that produce **Side Effect**s. The Receiver should be the single source of triggering side effects in a ModulaJS model.

```javascript
recvLoadSuccess() {
  return {
    type: ActionTypes.LOAD_SUCCESS,
    update(model, action) {
      const newModel = model.set('data', action.payload);

      return [
        newModel,                  // 1. newModel will be update to store and get rendered
        newModel.sendChildLoad,    // 2. the child component will begin to load automatically
        newModel.bubbleLoadSuccess // 3. the parent will receive a load success event
      ];
    }
  };
}
```

A side effect could be either one of:
- Another Sender (either the model's own sender or child model's sender via Method Delegation)
- A function bubbling event to ancestor models (`bubbleEvent(type)` calls should align with `eventTypes` definition)

The former one triggers side effects in current model or descendant models, while the latter one triggers side effects in ancestor models. By combination of the two, you may easily trigger side effects in the entire model tree.

### Side Effect Execution Order

The ModulaJS framework ensures side effects are queued at end of browser's event queue via a [`setTimeout()` trick](http://stackoverflow.com/a/4575011/245345). As a result, the execution order of side effects in the same array is **NOT** guaranteed. For example, in `[newModel, sendSideEffectA, bubbleSideEffectB]`, `sendSideEffectA` can depend on updated data in `newModel`, as newModel has been updated to Store before executing `sendSideEffectA`; but `bubbleSideEffectB` can **NOT** depend on any new data updated by `sendSideEffectA` (actually updated by corresponding `recvSideEffectA`), since it's not guaranteed that `bubbleSideEffectB` would be executed after `sendSideEffectA`/`recvSideEffectA`, not to mention `sendSideEffectA` itself might be an async call. To guarantee this, you may want to write them as *chained*, as following sample code:

```js
recvActionA() {
  return {
    type: 'ACTION_A',
    update(model, action) {
      const newModel = model.set('dataA', action.payload);

      return [
        newModel,
        newModel.sendSideEffectA
      ];
    }
  }
},

sendSideEffectA() {
  this.dispatch({
    type: 'SIDE_EFFECT_A',
    payload: 'some data'
  });

  // Or this is an async action
  // fetch('some_async_uri')
  //   .then(someSyncData => {
  //     this.dispatch({
  //       type: 'SIDE_EFFECT_A',
  //       payload: someSyncData
  //     });
  //   })
},

recvSideEffectA() {
  return {
    type: 'SIDE_EFFECT_A',
    update(model, action) {
      const newModel = model.set('dataB', action.payload);

      return [
        newModel,
        newModel.bubbleSideEffectB
      ];
    }
  }
}
```

Another "order" related topic in side effects is the order of Bubble Event watchers. If there're multiple event watchers in ancestor models' path, nearer one will be triggered first (bottom-up). When event bubbling is triggered as a side effect, the bubbling function itself is queued at end of browser's event queue as well, but all its event watchers are triggered (in bottom-up order) at the same event queue slot of bubbling function. Lastly, it's common that an event watcher calls a Sender function.
