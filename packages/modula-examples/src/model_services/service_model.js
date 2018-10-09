import { Model } from 'modula';

// a service definition is a higher order function
// that when called with service parameters
// should return a createService function
// which will later be called by modula internal
const timeService = function timeService(onReceiveTime) {
  return function createService(getModel) {
    let intervalId = null;
    let count = 0;

    // a service can hook to model lifecycle
    return {
      modelDidMount() {
        intervalId = setInterval(() => {
          const model = getModel(); // get latest model

          count += 1;

          const time = new Date().toUTCString();

          onReceiveTime(model, time);
        }, 1000);
      },

      modelWillUnmount() {
        if (intervalId !== null) {
          clearInterval(intervalId);
        }
      },

      // can be accessed via model.getService('service name').getCount
      getCount() {
        return count;
      }
    };
  };
};

const ActionTypes = {
  TIME_UPDATE: 'SERVICE_MODEL_TIME_UPDATE'
};

class ServiceModel extends Model {
  static actionTypes = ActionTypes;
  static defaultProps = {
    time: null
  };
  // declare your services to the static class variable services
  static services = {
    time: timeService((model, time) => model.sendTimeUpdate(time))
  };

  sendTimeUpdate(time) {
    this.dispatch({
      type: ActionTypes.TIME_UPDATE,
      payload: { time }
    });
  }

  recvTimeUpdate() {
    return {
      type: ActionTypes.TIME_UPDATE,
      update(model, action) {
        const { time } = action.payload;

        return [model.set('time', time)];
      }
    };
  }
}

export default ServiceModel;
