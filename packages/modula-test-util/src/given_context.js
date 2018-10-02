import { map, always } from 'ramda';
import { Model } from 'modula';

export default function givenContext(context, model) {
  class Parent extends Model {
    getChildContext() {
      return context;
    }
  }

  Parent.childContextTypes = map(always(null), context);
  Parent.defaultProps = {
    model: null
  };

  // eslint-disable-next-line no-new
  new Parent({ model });

  return model;
}
