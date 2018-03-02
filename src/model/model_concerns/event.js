import {
  map,
  includes,
  isString,
  isPlainObject,
  isArray,
  find,
  keys,
  difference
} from 'lodash';
import { hasParentModel, getParentModel } from './parent_pointer';
import { checkWithValidators } from './proptypes';
import { Debug } from '../../debug';

class ModulaEvent {
  constructor(name, initialModel) {
    this._name = name;
    this._trace = [initialModel];
  }

  _addModelToTrace(model) {
    this._trace.push(model);

    return this;
  }

  get name() {
    return this._name;
  }

  from(maybeModel) {
    if (isString(maybeModel)) {
      const modelNames = map(this._trace, m => m.displayName);

      return includes(modelNames, maybeModel);
    } else {
      return includes(this._trace, maybeModel);
    }
  }
}

export function checkEventTypes(eventTypes, modelName) {
  if (!isArray(eventTypes)) {
    throw new Error(`${modelName} should be an array`);
  }

  eventTypes.forEach(eventType => {
    if (!isString(eventType) && !isPlainObject(eventType)) {
      throw new Error(`invalid ${modelName}`);
    } else if (isPlainObject(eventType)) {
      if (!eventType.type || !eventType.payload) {
        throw new Error(`missing type or payload property in ${modelName}`);
      }
    }
  });
}

function getEventTypeDefinationByName(eventTypes, name) {
  return find(
    eventTypes,
    eventType => eventType === name || eventType.type === name
  );
}

function matchPayloadWithDefination(payload, payloadTypesDefination) {
  const payloadTypesDefinationKeys = keys(payloadTypesDefination);
  const payloadKeys = keys(payload);

  const diffKeys = difference(payloadKeys, payloadTypesDefinationKeys);

  if (diffKeys.length !== 0) {
    throw new Error(
      `passing payload data ${diffKeys.join(
        ', '
      )} which is/are not defined in eventTypes/watchEventTypes`
    );
  }
}

function validateEventPayload(currentEventTypeDefination, payload, modelName) {
  Debug.do(() => {
    // check if payload' names can match defination
    matchPayloadWithDefination(payload, currentEventTypeDefination.payload);

    // check if prameters' types can match defination
    checkWithValidators(
      currentEventTypeDefination.payload,
      payload,
      modelName,
      'prop'
    );
  });
}

function processEvent(model, evt, payload) {
  const { watchEventTypes } = model;
  const modelName = model.displayName;

  // validate watchEventTypes defination
  checkEventTypes(
    watchEventTypes,
    `watchEventTypes defination in model ${modelName}`
  );

  const matchedWatchEventTypeDefination = getEventTypeDefinationByName(
    watchEventTypes,
    evt.name
  );

  if (matchedWatchEventTypeDefination) {
    if (payload) {
      validateEventPayload(matchedWatchEventTypeDefination, payload, modelName);
    }

    model.watchEvent(evt.name, m => evt.from(m), payload);
  }

  if (hasParentModel(model)) {
    processEvent(getParentModel(model), evt._addModelToTrace(model), payload);
  }
}

export function bubbleEvent(model, name, payload) {
  const { eventTypes } = model;
  const modelName = model.displayName;

  // validate eventTypes defination
  checkEventTypes(eventTypes, `eventTypes defination in model ${modelName}`);

  const currentEventTypeDefination = getEventTypeDefinationByName(
    eventTypes,
    name
  );

  if (!currentEventTypeDefination) {
    throw new Error(`missing ${name} in eventTypes for model ${modelName}`);
  }

  if (payload) {
    validateEventPayload(currentEventTypeDefination, payload, modelName);
  }

  if (hasParentModel(model)) {
    const evt = new ModulaEvent(name, model);
    processEvent(getParentModel(model), evt, payload);
  }
}
