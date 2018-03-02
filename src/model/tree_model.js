import { Model } from './model';
import { Debug } from '../debug';

function getSpec(spec) {
  const { displayName, ...otherSpec } = spec;
  return {
    displayName: displayName || '<<anonymous TreeModel>>',
    ...otherSpec
  };
}

export function createTreeModel(spec, SuperClass = Model) {
  const TreeModel = class extends SuperClass {
    static specification = getSpec(spec);

    constructor(
      props = {},
      internalInstance = null,
      modelSpec = TreeModel.specification
    ) {
      if (SuperClass === Model) {
        const {
          propTypes = {},
          localPropTypes = {},
          defaults = {},
          contextTypes = {},
          childContextTypes = {},
          eventTypes = [],
          watchEventTypes = [],
          services = {},
          delegates = {},
          displayName = '<<anonymous TreeModel>>',
          ...extraBindings
        } = modelSpec;

        super({
          props,
          defaultProps: defaults,
          propTypes,
          localPropTypes,
          contextTypes,
          childContextTypes,
          eventTypes,
          watchEventTypes,
          services,
          delegates,
          displayName,
          extraBindings,
          internalInstance
        });
      } else {
        super(props, internalInstance, modelSpec);
      }
    }

    setMulti(attributes) {
      Debug.do(() => {
        this.validateProps(
          attributes,
          { ...this.propTypes, ...this.localPropTypes },
          `model ${this.displayName}`
        );
      });

      const { localAttrs, attrs } = this.extractAttrs(attributes);

      this.updateLocalProps(localAttrs);
      if (!this.shouldCreateNewInstance(attrs)) {
        return this;
      }

      return new TreeModel(
        this.mergeAttributes(attrs),
        this.__internalInstance__,
        TreeModel.specification
      );
    }
  };

  return TreeModel;
}
