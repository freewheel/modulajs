import { forEach, values, either, is, both, complement, when } from 'ramda';
import { isModel } from './is_model';
import { isImmutableType } from '../../immutable';

const isSomethingNaturallyImmutable = either(isModel, isImmutableType);
const isObjectOrArray = either(is(Object), is(Array));
const shouldFreeze = both(
  complement(isSomethingNaturallyImmutable),
  isObjectOrArray
);

function deepFreeze(obj) {
  forEach(when(shouldFreeze, deepFreeze), values(obj));

  return Object.freeze(obj);
}

export default function freezeProps(props) {
  return deepFreeze(props);
}
