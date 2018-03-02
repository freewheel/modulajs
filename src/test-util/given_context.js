import PropTypes from 'prop-types';
import { reduce } from 'lodash';
import { Model } from '../model';
import { ensureParentPointerOnChildModels } from '../model/model_concerns/parent_pointer';

export function givenContext(context, model) {
  const childContextTypes = reduce(
    context,
    (memo, value, key) => ({
      ...memo,
      [key]: PropTypes.any
    }),
    {}
  );

  const p = new Model({
    propTypes: {
      model: PropTypes.any
    },

    defaults: {
      model: null
    },

    childContextTypes,

    props: {
      model
    },

    extraBindings: {
      getChildContext() {
        return context;
      }
    }
  });

  ensureParentPointerOnChildModels(p);

  return model;
}
