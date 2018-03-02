## Model-to-Model Communications

Sometimes a model need to talk to another model. For complicated states, they probably communicate even more often. ModulaJS model provides several mechanisms to handle the different communication directions.

### Parent-to-Child

If the other model is a descendant, we could use one of those 2 methods to communicate.

#### Mutate Child Directly

We could mutate the child directly, which require the child to provider some mutation methods:

```javascript
const ParentModel = createModel({
  displayName: 'ParentModel',

  propTypes: {
    content: PropTypes.string,
    child: PropTypes.instanceOf(ChildModel)
  },

  sendClear() {
    this.dispatch({ type: ActionTypes.CLEAR });
  },

  recvClear() {
    return {
      type: ActionTypes.CLEAR,
      update(model) {
        const newModel = model.setMulti({
          content: '',
          // the clear method is a mutation method provided by child model
          // which will return a 'cleared' child model
          child: c => c.clear()
        });

        return [ newModel ];
      }
    };
  }
});
```

The pro for this pattern is that the operation is 'atom'.

#### Call Child Sender

Or we could use SideEffect + Method Delegation to solve the problem.

```javascript
const ParentModel = createModel({
  displayName: 'ParentModel',

  propTypes: {
    content: PropTypes.string,
    child: PropTypes.instanceOf(ChildModel)
  },

  delegates: {
    child: [
      { method: 'sendClear', as: 'sendChildClear' }
    ]
  },

  sendClear() {
    this.dispatch({ type: ActionTypes.CLEAR });
  },

  recvClear() {
    return {
      type: ActionTypes.CLEAR,
      update(model) {
        const newModel = model.set('content', '');

        return [
          newModel,
          // this additional side effect will dispatch another action to clear child
          newModel.sendChildClear
        ];
      }
    };
  }
});
```

The difference is that call child sender will dispatch another action and will trigger view rendering twice.


### Child-to-Parent

If the other model is a ancestor, we also have two ways to handle the communication.

#### Event Bubbling

As the name indicted, a model fires an **Event** with a specific `type`, bubbles to its parent model and all the way to the root model, any model in the path that watches the event of specific `type` will get notified when event arrives.

Payload can be passed up to those events watchers by setting the second argument for `bubbleEvent` calls and data types in payload also have to be declared both in eventTypes and watchEventTypes. Similar to `PropTypes`, payload data should be `Immutable` if necessary.

![ModulaJS Event Flow](images/modula_eventflow.png)

```javascript
const ParentModel = createModel({
  displayName: 'ParentModel',

  propTypes: {
    child: PropTypes.instanceOf(ChildModel)).isRequired
  },

  watchEventTypes: [
    'childUpdated',
    {
      type: 'refreshHeader',
      payload: {
        ids: ImmutablePropTypes.listOf(PropTypes.number),
        refreshImmediately: PropTypes.bool
      }
    }
  ],

  watchEvent(type, from, payload) {
    if (type === 'childUpdated' && from('ChildModel')) {
      // Do something
    } else if (type === 'refreshHeader' && from('ChildModel')) {
      this.sendRefreshHeader(payload);
    }
  }
});

const ChildModel = createModel({
  displayName: 'ChildModel',

  eventTypes: [
    'childUpdated',
    {
      type: 'refreshHeader',
      payload: {
        ids: ImmutablePropTypes.listOf(PropTypes.number),
        refreshImmediately: PropTypes.bool
      }
    }
  ],

  recvChange() {
    return {
      type: ActionTypes.CHILD_CHANGE,
      update(model) {
        const newModel = model.set('value', 'new');

        return [
          newModel,
          newModel.bubbleChildUpdated
        ];
      }
    };
  },

  bubbleChildUpdated() {
    this.bubbleEvent('refreshHeader', {
      ids: new List([1, 2]),
      refreshImmediately: true
    });
  }
});
```

Once `child.bubbleChildUpdated()` is called, the event `childUpdated` will be bubbled to `parentModel`, then `parentModel.watchEvent(type, from)` would be invoked to handle the event.

If there're multiple watching model in the ancestors path, all them will be notified, and the closer one will be notified first.

#### modelDidUpdate Life Cycle Hook

There's a special model life cycle hook called `modelDidUpdate(oldModel, newModel)`.
An interesting fact of this life cycle hook is that any time when a child model is updated, the parentModel.modelDidUpdate will be called. That means we could utilize this life cycle to identify child changes.

```javascript
const ParentModel = createModel({
  displayName: 'ParentModel',

  propTypes: {
    otherAttribute: PropTypes.any,
    child: PropTypes.instanceOf(ChildModel)).isRequired
  },

  modelDidUpdate(oldParentModel, newParentModel) {
    const oldChild = oldParentModel.get('child');
    const newChild = newParentModel.get('child');

    if (oldChild !== newChild) {
      // ok a child update is caught
      if (oldChild.get('name') !== newChild.get('name')) {
        // do something special
      }
    }
  }
});
```

### Sibling-to-Sibling

If two sibling models need to communicate with each other, their common parent needs to become the coordinator.

And then we can use the one of the above "Child-to-Parent" methods to let the parent know that something happens to one model, and the parent model could then use one of the "Parent-to-Child" methods to update the sibling model.

## Model-to-View Communication

The model-to-view communication is quite straightforward. Taking React components as an example, a TodoModel instance is passed into TodoComponent as `model` prop:

```javascript
const TodoComponent = ({ model }) => (
  <div>{ model.get('todoList').get(0) }</div>
);

TodoComponent.propTypes = {
  model: PropTypes.instanceOf(TodoModel).isRequired
};
```

## View-to-Model Communication: Sender and Receiver

In contrast with above model-to-view communication, the view-to-model communication is relatively complex.

In ModulaJS framework, we introduce the **Sender and Receiver** pairs in models. A Sender is an instance method with "send" prefix, e.g. `sendTodoAdd()`; it should always dispatch an **Action** with specific `type` and `payload` by calling `this.dispatch(action)`. A Receiver is an instance method with "recv" prefix, and must be in a pair with corresponding Sender, e.g. `recvInit()`; it should always return a object: `{type: string, update: function(model, action)}`, the update() function returns a list of side effects and as a convention the first one must be the new model. An example as follows.

```javascript
const ActionTypes = createConstants('TODO', {
  ADD: null
});

const TodoModel = createModel({
  displayName: 'TodoModel',

  propTypes: {
    todoList: ImmutablePropTypes.listOf(PropTypes.string)
  },

  sendAdd(todo) {
    this.dispatch({
      type: ActionTypes.ADD,
      payload: { todo }
    });
  },

  recvAdd() {
    return {
      type: ActionTypes.ADD,
      update(model, action) {
        const { todo } = action.payload;
        const newModel = model.set('todoList', list => list.push(todo));

        return [ newModel ];
      }
    };
  }
});
```

TodoComponent could call `model.sendAdd()`, then the `ADD` action is dispatched and then be delegated to the `recvAdd.update`, which returns a new model. Later TodoComponent gets notified and re-renders with the new model.
