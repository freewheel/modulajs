ModulaJS ship with a few helper functions to make testing easy.

## `givenContext({ key: value, ...}, model)`

returns a wrapped model which can access those provided context key/values.

```javascript
import { TestUtil } from 'modula-test-util';

const model =
  TestUtil.givenContext({
    {
      value1: 'a',
      gettext: a => a
    },
    new Model()
  });

model.getContext('value1') === 'a';
model.getContext('gettext') == a => a;
```

## `processAction(model, action)`

Apply the `action` to `model`, and returns an array of side effects.
The first item in side effects is the newModel while the others are other side effect functions. The last function would be a special side effect function for triggering life cycle hooks.

```javascript
import { Model } from 'modulajs';
import { TestUtil } from 'modula-test-util';

const ActionTypes = {
  CHANGE: 'MY_MODEL_CHANGE'
};

class MyModel extends Model {
  modelDidUpdate(oldModel, newModel) {
    this.sendZ(oldModel, newModel);
  }

  recvChange() {
    return {
      type: ActionTypes.CHANGE,
      update(model) {
        const newModel = model.set('a', 'b');

        return [
          newModel,
          newModel.sendX,
          newModel.sendY
        ];
      }
    }
  }
}

const model = new MyModel();
const action = { type: ActionTypes.CHANGE };

const [ newModel, sideEffect1, sideEffect2, lifeCycleSideEffect ] =
  TestUtil.processAction(model, action)

newModel == model.set('a', 'b');
sideEffect1 === newModel.sendX;
sideEffect2 === newModel.sendY;

// lifeCycleSideEffect once been called will return a Promise object
// which we can then chain with a thenable block to make assertions
// make sure we returned the Promise so mocha knows we're running some async tests
return lifeCycleSideEffect().
  then(() => {
    // modelDidUpdate will be triggered
    // sendZ will be called here with model and newModel respectively
  });
```

## `createAction(model, action)`

return a different version action with internal marks.
Usually it's worked together with sender tests, where we assert that dispatch function is called with an action

```javascript
import { TestUtil } from 'modula-test-util';
import sinon from 'sinon';

const dispatch = sinon.spy();

const model =
  TestUtil.givenContext(
    { dispatch },
    new Model()
  );

const action = {
  type: 'SOME_TYPE',
  payload: {
    name: 'abc', id: 123
  }
};

const internalAction = TestUtil.createAction(model, action);

model.sendSomeType();

expect(dispatch.calledWith(internalAction)).to.be.true;
```
