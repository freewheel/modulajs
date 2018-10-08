import { Model } from 'modula';

const timeService = function timeService(onReceiveTime) {
  return function createService(getModel) {
    let intervalId = null;
    let count = 0;

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

ServiceModel.actionTypes = ActionTypes;
ServiceModel.defaultProps = {
  time: null
};
ServiceModel.services = {
  time: timeService((model, time) => model.sendTimeUpdate(time))
};

export default ServiceModel;
