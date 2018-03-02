Many model instances forms a model tree.
The original immutable model tree, let's call it version 1, once be modified will generate a slightly different tree, which can be called version 2. The object pointer are different for version 1 and version 2 model trees.

In such context, There're a few events that could be useful in development:

- When a new model is created and **mounted** to a model tree
- When a existing model is removed and **unmounted** from a model tree
- When a existing model is **updated** inside the model tree

In ModulaJS, we support following life cycle hooks which will be triggered when the above events happened.

- `modelDidMount()`
- `modelDidUpdate(oldModel, newModel)`
- `modelWillUnmount()`

**Note** Given a model tree, the order of life cycle hook executions are not guaranteed for child models. For example a child model's `modelDidMount` could be called earlier than its parent, so please do not assume any order here.

### Use Case 1

An table model when initialized need to trigger an additional request to fetch table data from server.

```javascript
const TableModel = createModel({
  modelDidMount() {
    this.sendTableDataLoad();
  },

  sendTableDataLoad() {
    // fetch data asynchronously and dispatch
    return fetch('table.list').
      then({ data } => {
        this.dispatch({
          type: ActionTypes.TABLE_DATA_LOAD,
          payload: { data }
        });
      });
  },

  recvTableDataLoad() {
    return {
      type: ActionTypes.TABLE_DATA_LOAD,
      update(model, action) {
        const { data } = action.payload;

        return [
          model.setMulti({
            isLoading: false,
            data: fromJS(data) // transform mutable data object into immutable map
          })
        ];
      }
    };
  }
})
```

### Use Case 2

A page when entering need to start polling from server for changes.
But after leaving the page the polling should stop.

```javascript
const InboxModel = createModel({
  modelDidMount() {
    this.sendPollingStart();
  },

  modelWillUnmount() {
    this.sendPollingEnd();
  },

  sendPollingStart() {
    // start polling
    // maybe a setInterval
  },

  sendPollingEnd() {
    // stop polling
    // maybe clear the setInterval handler
  }
});
```
