### Why do we need model services

As we know that model instances are designed to be immutable, which means every time when something changes, a new model version would be created. When we have everything immutable, you can live with the assumption that "the data we read would never be changed by careless others", which is amazing.

But sometimes the reality is skinny. Much of existing infrastructure were built in mutable way, and in some cases, in order to work with existing infrastructure, you need the ability to deal with mutable data.

One typical example is `setInterval`, which returns an `intervalId`, which later could be passed to `clearInterval` to stop the interval callback from running again.
In this scenario, you need to store the `intervalId` somewhere inside the reachable context for a model instance.

One possible solution is to define a prop named `intervalId` and dispatch an action to set the value after `setInterval`.
A drawback of this design is that `intervalId` is an implementation detail, while model prop could be considered as a public interface to users of the model, because they can directly touch the prop value, but for `intervalId` it would be quite confusing for users to see such a prop.
The situation would be even worse in some cases like `subscribe` function, usually returns a `unsubscribe` function, which could be called later to stop the subscription. The above solution doesn't make any sense in this scenario, as a violation to our eslint rule, it's ridiculous to set a `unsubscribe` function prop to a model!

With these examples we realized that having some tools to deal with mutable data would still be necessary, so comes the `model services` concept.

### How to use model services

Let's start from a piece of code which describes a interval service:

```javascript
import { Model } from 'modulajs';

class ServiceModel extends Model {
  static services = {
    pollMessages: function createService(getModel) {
      // store some state in the closure
      let intervalId = null;
      let pollCounter = 0;

      return {
        // this hook will be called when model is added to the model tree
        modelDidMount() {
          intervalId =
            setInterval(() => {
              fetchMessages().
                then(messages => {
                  const model = getModel();

                  model.sendMessagesUpdate(messages);
                });

              pollCounter = pollCounter + 1;
            }, 1000);
        },

        // this hook will be called when model is removed from the tree
        modelWillUnmount() {
          if (intervalId !== null) {
            clearInterval(intervalId);
          }
        },

        getCounter() {
          return pollCounter;
        }
      };
    };
  };

  sendMessagesUpdate() {
    this.getService('pollMessages').getCounter(); // access service methods
    this.getService('pollMessages').modelDidMount; // life cycle method can also be accessed, it's useful for testing
  }
}
```

The example above describes a service called `pollMessages`, which will call `setInterval` when the model is mounted to the tree and `clearInterval` with the saved `intervalId` while the model is unmounted from the tree.

The service definition for `pollMessages` is a function named as `createService`, which will be called during model initialization, with a function parameter named `getData` in this case. The `getData` function when called returns (the latest version of) the model. The object returns by the `createService` becomes a service instance, and can be retrieved by calling `model.getService('pollMessages')`.

The service instance can define life cycle hooks that has exactly the same signature of model life cycle hooks, including `modelDidMount`, `modelWillUnmount` and `modelDidUpdate`. ModulaJS will be in charge of calling them at right timing. Similar to `getCounter` method, those life cycle hooks such as `modelDidMount` can also be retrieved directly from the service instance, which will help us to test the service itself (only if the service is anonymous, it's recommended to extract the `createService` function out, and we can easily test that function, we'll explain more in the next 'Reusable model services' section).

```javascript

const service = model.getService('pollMessages');
const sendMessagesUpdate = sinon.stub(model, 'sendMessagesUpdate');

service.modelDidMount();

const clock = sinon.useFakeTimers();
clock.tick(2999);

expect(sendMessagesUpdate.calledTwice).to.be.true;
```

The beauty of the example service is that it utilize the closure within the `createService` to store the intervalId and pollCounter, so the implementation detail is well isolated and could not be accessed directly by model.

### Reusable model services

Given that usually a service doesn't need to bound to a specific model, it's recommended to extract the service, test it individually, and even export it as a common stuff to be shared by many models, for example the same pollMessages service as above but reuses a common `intervalService`:

```js
// interval_service.js
export default function intervalService(interval, callback) {
  return function createService(getModel) {
    let intervalId = null;
    let pollCounter = 0;

    return {
      modelDidMount() {
        intervalId =
          setInterval(() => {
            callback(getModel());
            pollCounter = pollCounter + 1;
          }, 1000);
      },

      modelWillUnmount() {
        if (intervalId !== null) {
          clearInterval(intervalId);
        }
      },

      getCounter() {
        return pollCounter;
      }
    };
  };
}

// model.js
import { intervalService } from 'interval_service';

class ServiceModel extends Model {
  static services = {
    pollMessages: intervalService(1000, (model) => {
      fetchMessages().then(model.sendMessagesUpdate);
    })
  };
}
```

### Deserializability

One interesting fact for a model tree is that it should be possible to be serialized as a big object, and later be deserialized given the same object.

We can imagine that, existing model life cycle hooks should be skipped when doing the deserialization, to prevent some life cycle hooks from loading new data from server and overriding the restored state.

But the life cycle of services are different stories.
The service life cycle should always be called even it's deserializing data, or the service cannot function properly (like the interval service).

It's very useful to take this "serializability" and "deserializability" into account when designing a new service, so that we would be more careful and can spend some time making sure the service would still function properly after the deserialization.
