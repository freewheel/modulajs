import { reduce, keys, merge, pick, omit, toPairs, forEach, is } from 'ramda';
import { Model } from 'modula';

const PredefinedSpecKeys = [
  'actionTypes',
  'propTypes',
  'defaults',
  'contextTypes',
  'childContextTypes',
  'services',
  'delegates',
  'displayName'
];

function getPredefinedSpec(spec) {
  return pick(PredefinedSpecKeys, spec);
}

function getCustomSpec(spec) {
  return omit(PredefinedSpecKeys, spec);
}

function replaceValues(comment, types) {
  return reduce(
    (memo, key) => merge(memo, { [key]: comment }),
    {},
    keys(types)
  );
}

function checkCompatibility(spec) {
  if (spec.eventTypes || spec.watchEventTypes) {
    throw new Error(
      'model event support has been removed, please utilize modelDidUpdate instead'
    );
  }

  if (spec.localProps || spec.localPropTypes) {
    throw new Error(
      'model local props support has been removed, please move props back to propTypes instead, and remove connectLocal from component side'
    );
  }

  if (spec.defaults && is(Function, spec.defaults)) {
    throw new Error(
      'model support for "defaults" value is a function has been removed, please move the function to each attribute of defaults'
    );
  }

  // TODO check contextTypes and childContextTypes
  // should all be PropTypes.func or PropTypes.func.isRequired
  // throw error if found other types

  forEach(([key, value]) => {
    if (!is(Function, value)) {
      throw new Error(
        `"${key}" provided in createModel is not a function; for non-predefined spec keys model will assume all of their values are function now`
      );
    }
  }, toPairs(getCustomSpec(spec)));
}

export default function createModel(spec) {
  if (process.env !== 'production') {
    checkCompatibility(spec);
  }

  const systemSpec = getPredefinedSpec(spec);
  const customSpec = getCustomSpec(spec);

  class BusinessModel extends Model {}

  forEach(([key, value]) => {
    BusinessModel.prototype[key] = value;
  }, toPairs(customSpec));

  if (systemSpec.actionTypes) {
    BusinessModel.actionTypes = systemSpec.actionTypes;
  }

  if (systemSpec.contextTypes) {
    // we assume all context types are functions now
    // and the value becomes a text description about
    // what we provide/consume the context
    BusinessModel.contextTypes = replaceValues(null, systemSpec.contextTypes);
  }

  if (systemSpec.childContextTypes) {
    BusinessModel.childContextTypes = replaceValues(
      'Migrated from legacy child context types',
      systemSpec.childContextTypes
    );
  }

  if (systemSpec.propTypes) {
    BusinessModel.propTypes = systemSpec.propTypes;
  }

  if (systemSpec.defaults) {
    BusinessModel.defaultProps = systemSpec.defaults;
  }

  if (systemSpec.services) {
    BusinessModel.services = systemSpec.services;
  }

  if (systemSpec.delegates) {
    BusinessModel.delegates = systemSpec.delegates;
  }

  if (systemSpec.displayName) {
    BusinessModel.displayName = systemSpec.displayName;
  }

  return BusinessModel;
}
