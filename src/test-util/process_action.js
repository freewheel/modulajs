import { reactionReducer } from '../reaction';
import { createAction } from './create_action';
import {
  hasParentModel,
  getParentModel,
  setParent
} from '../model/model_concerns/parent_pointer';

export function processAction(model, action) {
  // wrapped by TestUtil.givenContext
  if (hasParentModel(model)) {
    const parentModel = getParentModel(model);

    const [newParentModel, ...sideEffects] = reactionReducer(
      parentModel,
      createAction(model, action)
    );

    const newModel = newParentModel.get('model');

    setParent(newModel, parentModel);

    return [newModel, ...sideEffects];
  } else {
    return reactionReducer(model, createAction(model, action));
  }
}
