import React, { Component } from 'react';
import {
  uniq,
  concat,
  map,
  dropLast,
  flatten,
  forEach,
  prop,
  find,
  reject,
  anyPass,
  identical,
  length
} from 'ramda';
import debug from 'debug';
import Trie from './concerns/trie';
import pathDiff from './concerns/path_diff';
import { isAncestor, isDesendant } from './concerns/fiber';
import HotZoneContext from './hot_zone_context';
import { getDisplayName } from './display_name';

const rootDebug = debug('modula-react:root');

/*
# Rule 1 Use More General Self

If in the list there's a component which
  - is the same component
  - its pathDepth < current component's pathDepth

remove current component from the list


# Rule 2 Use More Specific Ancestor

If in the list there's a component which
  - is an ancestor of current component, and
  - its pathDepth >= current component's pathDepth

remove current component from the list


# Rule 3 Use More Specific Descendant

If in the list there's a component which
  - is a descendant of current component, and
  - its pathDepth > current component's pathDepth

remove current component from the list
*/
// this detection utilize _reactInternalFiber
// which is only available for react v16+
// support for older version is not considered
function safelyRemoveUnnecessaryUpdatesFor(impactedComponents) {
  const rule1 = ({ path: currentComponentPath, value: currentComponent }) =>
    find(
      ({ path, value: component }) =>
        length(path) < length(currentComponentPath) &&
        identical(component, currentComponent)
    )(impactedComponents);

  const rule2 = ({ path: currentComponentPath, value: currentComponent }) =>
    find(
      ({ path, value: component }) =>
        length(path) >= length(currentComponentPath) &&
        isAncestor(
          component._reactInternalFiber,
          currentComponent._reactInternalFiber
        )
    )(impactedComponents);

  const rule3 = ({ path: currentComponentPath, value: currentComponent }) =>
    find(
      ({ path, value: component }) =>
        length(path) > length(currentComponentPath) &&
        isDesendant(
          component._reactInternalFiber,
          currentComponent._reactInternalFiber
        )
    )(impactedComponents);

  return reject(anyPass([rule1, rule2, rule3]), impactedComponents);
}

class LeanRenderer {
  constructor() {
    this.hotZones = new Trie();
  }

  registerZone(path, component) {
    this.hotZones.add(path, component);
    rootDebug('registered', path, getDisplayName(component), this.hotZones);
  }

  unregisterZone(path, component) {
    this.hotZones.remove(path, component);
    rootDebug('unregistered', path, getDisplayName(component), this.hotZones);
  }

  // safty first
  updateZones(oldRoot, newRoot) {
    const { updatedPaths, deletedPaths, createdPaths } = pathDiff(
      [],
      oldRoot,
      newRoot
    );

    const impactedPaths = uniq(
      concat(
        updatedPaths,
        // changes like deletion and creation should propagate to its parent
        // themselves are unable to handle the changes
        concat(map(dropLast(1), deletedPaths), map(dropLast(1), createdPaths))
      )
    );

    rootDebug('impacted paths: ', impactedPaths);

    // find all components that are registered on impacted paths
    const impactedComponents = uniq(
      flatten(
        map(this.hotZones.valuesInPath.bind(this.hotZones), impactedPaths)
      )
    );

    rootDebug('impacted components: ', impactedComponents);

    const responsibleComponents = safelyRemoveUnnecessaryUpdatesFor(
      impactedComponents
    );

    rootDebug('responsible components: ', responsibleComponents);

    forEach(component => {
      rootDebug('triggering render: ', component);
      component.forceUpdate();
    }, map(prop('value'), responsibleComponents));
  }
}

export default function createContainer(store, DecoratedComponent) {
  let lastModel = store.getState();
  const renderer = new LeanRenderer();

  function handleUpdate() {
    const newModel = store.getState();

    if (newModel !== lastModel) {
      const oldModel = lastModel;
      // since rendering can be much slower
      // "commit" first then trigger rendering
      // to avoid possible race condition
      // maybe we can queue rendering request here
      // to avoid some "renderings in the middle"
      lastModel = newModel;
      renderer.updateZones(oldModel, newModel);
    }
  }

  return class RootComponent extends Component {
    componentWillMount() {
      this.unsubscribe = store.subscribe(handleUpdate);
      renderer.registerZone([], this);
      store.getState().sendInit();
    }

    componentWillUnmount() {
      this.unsubscribe();
      renderer.unregisterZone([], this);
      store.getState().sendDestroy();
    }

    render() {
      const rootModel = store.getState();

      if (rootModel && rootModel.get('decoratedModel')) {
        return (
          <HotZoneContext.Provider
            value={{
              getStateInPath: path => store.getState().getIn(path),
              registerZone: renderer.registerZone.bind(renderer),
              unregisterZone: renderer.unregisterZone.bind(renderer)
            }}
          >
            <DecoratedComponent model={rootModel.get('decoratedModel')} />
          </HotZoneContext.Provider>
        );
      } else {
        return <noscript />;
      }
    }
  };
}
