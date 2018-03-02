# Model APIs

Create a front end model which holds the state(data structure) of current page(or part of the page).
A model has a list of attributes, and an attribute value can be an instance of another model, or even a list of other model instances, in this way we are able to represent the whole page in just one model tree.

A ModulaJS model is strictly immutable, which means making any change to the model would create a new version of the model, which has different object pointer comparing to previous one.
The most typical calls that can change model are `set(key, value)` or `setMulti({ key1: value1, key2: value2 })`, as mentioned before, will return a new version model.

In typical ModulaJS apps, the state of a page is represent by a single root model. In order to update something, we always need to go through the "Action -> Dispatch -> Root Model -> locate the handling model -> Return updated handling model -> Return updated root model" cycle.
Fortunately, we don't have to worry about those too much details. The way we change state is by defining sender/receiver methods, where sender methods taking charge of creating Actions and dispatch then and receiver methods taking charge of defining what action to watch and specify the update callback.

## Static Methods

### `createModel(options)`

```javascript
import { createModel } from 'modulajs';

createModel({
  displayName,
  propTypes,
  defaults,
  contextTypes,
  childContextTypes,
  getChildContext,
  eventTypes,
  watchEventTypes,
  watchEvent,
  services,
  delegates,
  modelDidMount,
  modelDidUpdate,
  modelWillUnmount,
  [...senderMethods],
  [...receiverMethods],
  [...extraMethods]
});
```

Create and return a new Model of the given options.

**Parameters**

| Param | Type | Description |
| ----- | ---- | ----------- |
| displayName | string | A display name of the model that is convenient for debugging and logging |
| propTypes | object | Shape of the model props, defined by using `PropTypes` or `ImmutablePropTypes` |
| defaults | object | Default values of model props |
| contextTypes | object | Shape of context data that the model requires/consumes |
| childContextTypes | object | Shape of context data that the model produces; optional |
| getChildContext | function | A function returning the value of context data that the model produces, should align with the `childContextTypes` param; required if `childContextTypes` specified |
| eventTypes | string[] | Array of event types that the model fires by calling `model.bubbleEvent()`; only required when model fires events |
| watchEventTypes | string[] | Array of event types that the model watches; optional |
| watchEvent | function | `watchEvent(type, from)`: the callback function when the interested bubble event (defined in `watchEventTypes`) arrives at the model; param `type` is the event type, `from` is the `displayName` or reference of the source (descendant) model, no return value; required if `watchEventTypes` specified |
| services | object | service definitions |
| delegates | object | Delegate child models' methods, a special use case is to delegate children's senders |
| modelDidMount | function | Life cycle hook, will be called when a model is mounted to the model tree |
| modelDidUpdate | function | Life cycle hook, will be called when a model is updated inside the model tree |
| modelWillUnmount | function | Life cycle hook, will be called when a model is unmounted from the model tree |
| [...senderMethods] | function | Senders; functions with "send" prefix, should always dispatch an action by calling `this.dispatch()`; possible to be async operation, recommended to return the `Promise` for better testability; optional |
| [...receiverMethods] | function | Receivers; functions with "recv" prefix, should always return a object: `{type: string, update: function(model, action)}`, the update() function reduces the model; required if there is a corresponding `senderMethods` |
| [...extraMethods] | function | Extra getter and setter methods to make the model easier to use |

**Returns**: a model class that can be instantiated.

## Constructor

### `new ModelClass(props)`

```javascript
import { createModel } from 'modulajs';

const ModelClass = createModel(options);

new ModelClass(props);
```

**Parameters**

| Param | Type | Description |
| ----- | ---- | ----------- |
| props | object | Model props, should align with `propTypes`, will override default value if a key match the one in `defaults`; optional |

**Returns**: an instance of ModelClass.

## Instance Methods

* `get(key)` get value for given attribute key.
* `getIn(path)` get value for given path for a deep nested attribute, path is the array of keys.
* `updateIn(path)` update value for given path for a deep nested attribute, returns a new instance of model.
* `set(key, value)` like `Immutable.set`. value can be a function. Returns a new instance of model.
* `setMulti({ key: value })` set multiple key-values at once. value can be a function. Returns a new instance of model.
* `attributes()` returns an object with all property-values.
* `getService(name)` returns the specified service instance.
* `getServices()` returns all service instances.
* `childModels()` returns an array of all children which are instances of model.
* `childModelsRecursive()` returns an array of all descendants(children + grandchildren and more) which are instances of Model.
* `toJS()` returns an plain object representation of a model, all child model will be converted to plain object as well.

### `attributes()`

**Returns**: a map with all model attributes

### `bubbleEvent(eventName)`

**Parameters**

| Param      | Type   | Description    |
| ---------- | ------ | -------------- |
| eventName  | string | the event name |

**Returns**: null

### `childModels()`

**Returns**: An array of all child models which are descendants of current model

### `clear()`

**Returns**: a new model has all attributes equals to default values

### `dispatch(action)`

**Parameters**

| Param      | Type   | Description                                 |
| ---------- | ------ | ------------------------------------------- |
| action     | object | an object describes the intention of change |

**Returns**: null

### `get displayName`

**Returns**: displayName for current model

### `get(key)`

**Parameters**

| Param | Type   | Description             |
| ----- | ------ | ----------------------- |
| key   | string | the key of an attribute |

**Returns**: value of the model attribute

### `getContext(key)`

**Parameters**

| Param | Type   | Description                     |
| ----- | ------ | ------------------------------- |
| key   | string | the key of an context attribute |

**Returns**: value of the context attribute.

**Raises**: when context isn't defined in current model contextTypes or cannot find context attribute in parent models, an exception will be raise

### `getIn(path)`

**Parameters**

| Param | Type   | Description |
| ----- | ------ | ----------- |
| path  | array  | an array of strings indicating the position of a nested attribute |

**Returns**: the value of the attribute

### `getService(name)`

**Parameters**

| Param | Type   | Description                     |
| ----- | ------ | ------------------------------- |
| name  | string | the name of the service         |

**Returns**: service instance.

### `getServices()`

**Returns**: an object of service instances, where the key is the service name and value is the service instance.


### `set(key, value)`

alias: 'mutate'

**Parameters**

| Param   | Type     | Description                   |
| ------- | -------- | ----------------------------- |
| key     | string   | the key of an attribute       |
| value   | any      | the new value of an attribute |

**Returns**: a new model with the updated attribute; returns the old model if no attributes are mutated

### `setMulti({ key1: value1, key2: value2, ... })`

**Parameters**

| Param    | Type     | Description                   |
| -------- | -------- | ----------------------------- |
| keyN     | string   | the key of an attribute       |
| valueN   | any      | the new value of an attribute |

**Returns**: a new model with the updated attribute; returns the old model if no attributes are mutated

### `updateIn(path, valueOrMapFunc)`

**Parameters**

| Param | Type | Description |
| ----- | -----| ----------- |
| path | array | an array of strings indicating the position of a nested attribute |
| valueOrMapFunc | function | the new value of the attribute or the callback function which will be provided the current value of attribute and return an updated value |

**Returns**: a new model with the updated attribute; returns the old model if no attributes are mutated

### `toJS()`

**Returns**: a map which contains all attributes and the value of each attributes are also `toJS()`ed
