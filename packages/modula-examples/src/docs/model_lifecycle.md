Many model instances forms a model tree.
The original immutable model tree, let's call it version 1, once be modified will generate a slightly different tree, which can be called version 2. The object pointer are different for version 1 and version 2 model trees.

In such context, There're a few events that could be useful in development:

- When a new model is created and **mounted** to a model tree
- When a existing model is removed and **unmounted** from a model tree
- When a existing model is **updated** inside the model tree

In ModulaJS, we support following life cycle hooks which will be triggered when the above events happened.

- `modelDidMount()`
- `modelWillUpdate(sourceModel)`
- `modelDidUpdate(oldModel, newModel)`
- `modelWillUnmount()`

**Note** Given a model tree, the order of life cycle hook executions are not guaranteed for child models. For example a child model's `modelDidMount` could be called earlier than its parent, so please do not assume any order here.

### Use Case 1

An table model when initialized need to trigger an additional request to fetch table data from server.

```javascript
class TableModel extends Model {
  modelDidMount() {
    this.sendTableDataLoad();
  }

  sendTableDataLoad() {
    // fetch data asynchronously and dispatch
    return fetch('table.list').
      then({ data } => {
        this.dispatch({
          type: ActionTypes.TABLE_DATA_LOAD,
          payload: { data }
        });
      });
  }

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
}
```

### Use Case 2

A page when entering need to start polling from server for changes.
But after leaving the page the polling should stop.

```javascript
class InboxModel extends Model {
  modelDidMount() {
    this.sendPollingStart();
  }

  modelWillUnmount() {
    this.sendPollingEnd();
  }

  sendPollingStart() {
    // start polling
    // maybe a setInterval
  }

  sendPollingEnd() {
    // stop polling
    // maybe clear the setInterval handler
  }
}
```

### Use Case 3

A parent model need to constantly monitor and reconcile data within its territory.

```
class ParentModel extends Model {
  modelWillUpdate(oldModel) {
    // keep data in child1 and child2 in sync
    const dataFromChild1 = this.get('child1').get('data');
    const dataFromChild2 = this.get('child2').get('data');

    if (!deepEquals(dataFromChild1, dataFromChild2)) {
      if (oldModel.get('child1') !== this.get('child1')) {
        // use child1's data since update is from there
        return this.set('child2', child2 => child2.set('data', dataFromChild1));
      } else if (oldModel.get('child2') !== this.get('child2')) {
        // use child2's data since update is from there
        return this.set('child2', child2 => child2.set('data', dataFromChild1));
      }
    }

    return this;
  }
}
```
