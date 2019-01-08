Model is the basic unit to encapsulate State, together with some functions to manipulate states. A Model:

- defines the shape/type of the data (`propTypes`) and comes with default values (`default`)
- defines the shape/type of context data that it provides (`childContextTypes` and `getChildContext()`) or depends on (`contextTypes`)
- defines bubbling events that it fires (`eventTypes`) or watches (`watchEventTypes` and `watchEvent()`)
- contains pairs of sender and receiver functions that handles data flow logics (`sendSomeAction()` and `recvSomeAction()`)

This chapter introduced how to use the ModulaJS Model API, and explained some necessary design details. For a complete references of the API, please refer to [Model API](#docs-model-api).

## Creating a Model

Extend Model from modulajs package to create a ModulaJS model class.

### Props and Values

Assume you need to create a "todo item" model which contains a piece of data like `{ marked: false, text: 'some text' }`. We want to make sure `marked` is always a boolean and `text` is always a string. We can use `propTypes`, which you already got familiar with when learning React. By default, `marked` is `false` and `text` is `undefined`, we can use `defaults` to define these.

Once model class is defined, you may create its instances by using `new` keyword and a props object (its keys/values should match `propTypes`) as parameter.

```javascript
import { Model } from 'modulajs';
import PropTypes from 'prop-types';

class TodoModel extends Model {
  static defaultProps = {
    text: undefined,
    marked: false
  };
}

const todo = new TodoModel({ text: 123 }); // Error: text is expected to be a string
const todo = new TodoModel({ text: '123' }); // good

// models come with some default methods like `get`
todo.get('marked') // false
todo.get('text') // '123'
```

Unlike many other model implementations, in ModulaJS models will refuse to take in "unexpected" data. For example:

```js
const todo = new TodoModel({ text: 'some text', createAt: 1463691281790 });

todo.get('createAt') // undefined
```

So if you need any additional data, you need to define it in `propTypes` first.

When defining `defaults` in Model, please make sure to use functions to define non-primitive defaults values, so those functions only executed when the Model is initialized.

```js
// GOOD
defaults: {
  // `list` is initialized when Model instantiation, so that every new Model
  // instance will have a new instance of `List`.
  list: () => new List(),
  name: "model"
}

// BAD
defaults: {
  // `list` is initialized before Model instantiation, so the value will be
  // shared by all instances of current Model, which may cause unpredictable
  // issues afterward.
  list: new List(),
  name: "model"
}
```

### Display Name

It's recommended to provide a `displayName` for a Model, which allows ModulaJS to build friendly error messages.

### Extra Methods

You can provide some extra getter and setter methods to make the Model easier to use. In the following example, we provide a setter function `mark` to toggle `marked`, and a getter function `isValid` to check if the text is undefined.

Please note that any setter function should always return a new instance, just like `set`.

```javascript
import { Model } from 'modulajs';

class TodoModel extends Model {
  static defaultsProps = {
    text: undefined,
    marked: false
  };

  mark() {
    return this.set('marked', !this.get('marked'));
  }

  isValid() {
    return this.get('text') !== undefined;
  }
}

const todo = new TodoModel();
const newTodo = todo.mark();

newTodo.get('marked') // true
```

## Updating the Model and Immutability

A model comes with a `set` function, with which you can mutate the data in the model. However, models are immutable, so `set` will always return a new instance, and the old instance remains the same.

```javascript
const todo = new TodoModel();
const newTodo = todo.set('marked', true);

newTodo.get('marked') // true
todo.get('marked') // false
todo === newTodo // false
```

There are other APIs to mutate the immutable model:
* `get(key)` like `Immutable.get`.
* `getIn(path)` like `Immutable.getIn`.
* `updateIn(path)` like `Immutable.updateIn`. Returns a new instance of Model.
* `set(key, value)` like `Immutable.set`. value can be a function. Returns a new instance of Model.
* `setMulti({ key: value })` set multiple key-values at once. value can be a function. Returns a new instance of Model.
* `attributes()` returns an object with all property-values.
* `toJS()` returns an plain object representation of a model, all child model will be converted to plain object as well.

## Hierarchy

One model is not enough to express all your data. Naturally you will want to nest your models, just like how you nest up your components. ModulaJS is designed in a way that you can easily manage deep nested models and localize data for every component.

The following example is a `TodosModel` which contains a list of `TodoModel`.

```javascript
import { List } from 'immutable';
import { Model } from 'modulajs';
import ImmutablePropTypes from 'react-immutable-proptypes';
import TodoModel from './todo_model.js';

class TodosModel extends Model {
  static defaults = {
    todos: new List()
  };

  addTodo(text) {
    return this.set('todos', (todos) => {
      return todos.unshift(new TodoModel({ text }));
    });
  }

  markAll() {
    return this.set('todos', (todos) => {
      return todos.map((todo) => {
        return todo.set('marked', true);
      });
    });
  }
}

TodosModel.fromJS = function(definition) {
  const todos = definition.todos || [];

  return new TodosModel({
    todos: new List(map(todos, (todo) => new TodoModel(todo)))
  });
};
```

In above example code, `TodoModel.fromJS(definition)` method is not provide in ModulaJS Model API, but it's recommended to add this static method to your model class if the model contains a hierarchy.

In business module or library component development, the model usually forms a model tree.

### Context

In ModulaJS model, a **Context** is a special prop, that is shared with all descendant models. It has a similar design to the [Context of React](https://reactjs.org/docs/context.html). The context is useful to avoid passing a prop down manually level by level. The following example demonstrates who to define and use context.

```javascript
class GridModel extends Model {
  static defaultProps = {
    table: () => new TableModel()
  };

  static childContextTypes = {
    someContext: 'context description'
  };

  getChildContext() {
    return {
      someContext: 'some text'
    };
  }
}

class TableModel extends Model {
  static defaultProps = {
    rows: () => new TableRowsModel()
  };
}

class TableRowsModel extends Model {
  // ...

  static contextTypes = {
    someContext: 'context description'
  };

  someMethod() {
    const someContext = this.getContext('someContext'); // 'some text'
  }
}
```

A context can also be a function (`PropTypes.func`), so that the descendant model can invoke methods defined in an ancestor model. But please note that, the function-as-context feature is usually used to pass some utility functions, DO NOT abuse it in other use cases. For example, if a descendant model would like to mutate ancestor model, do not pass `set()` method as context, but leverage Sender and Receiver mechanism that will be introduced in next section.

### Method Delegation

Sometimes you define some convenient instance methods in a model, then add the model as a child of a parent model, and you need to "expose" those methods in parent model. It's possible to add a wrapper method:

```javascript
class GridModel extends Model {
  static defaultProps = {
    table: () => new TableModel()
  };

  getRowIds() {
    return this.get('table').getRowIds();
  }

  getSelectedRowIds() {
    return this.get('table').getSelectedRowIds();
  }
}
```

Think of the situation that you have many methods to expose. There is a better way to achieve this, which is `delegates` option:

```javascript
class GridModel extends Model {
  static defaultProps = {
    table: () => new TableModel()
  };

  static delegates = {
    table: [
      { method: 'getRowIds' },
      { method: 'getSelectedRowIds' }
    ]
  };
}
```

The `delegates` way is recommended for most **Method Delegation** cases.
