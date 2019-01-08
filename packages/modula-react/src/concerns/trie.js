import {
  reject,
  append,
  isEmpty,
  contains,
  map,
  reduce,
  ifElse,
  always,
  pipe,
  concat,
  has
} from 'ramda';

function isEmptyNode(node) {
  return isEmpty(node.children) && isEmpty(node.values);
}

// https://en.wikipedia.org/wiki/Trie
export default class Trie {
  constructor() {
    this.tree = {
      children: {},
      values: []
    };
  }

  at(path) {
    return reduce(
      (node, p) => {
        if (node && node.children[p]) {
          return node.children[p];
        } else {
          return undefined;
        }
      },
      this.tree,
      path
    );
  }

  has(path) {
    return this.at(path) !== undefined;
  }

  getValues(path) {
    const nodeAtPath = this.at(path);

    return nodeAtPath && nodeAtPath.values;
  }

  valuesInPath(path) {
    const result = reduce(
      ({ node, visitedPath, valuesInPath }, p) => {
        if (node && has(p, node.children)) {
          const child = node.children[p];
          const currentPath = append(p, visitedPath);

          return {
            node: child,
            visitedPath: currentPath,
            valuesInPath: ifElse(
              isEmpty,
              always(valuesInPath),
              pipe(
                map(value => ({ path: currentPath, value })),
                concat(valuesInPath)
              )
            )(child.values)
          };
        } else {
          return { node, visitedPath, valuesInPath };
        }
      },
      {
        node: this.tree,
        visitedPath: [],
        valuesInPath: map(value => ({ path: [], value }), this.tree.values)
      },
      path
    );

    return result.valuesInPath;
  }

  add(path, item) {
    let currentNode = this.tree;

    // create missing nodes along the way
    path.forEach(p => {
      if (!currentNode.children[p]) {
        currentNode.children[p] = {
          children: {},
          values: []
        };
      }

      currentNode = currentNode.children[p];
    });

    currentNode.values = append(item, currentNode.values);
  }

  remove(path, item) {
    let currentNode = this.tree;
    const parentStack = [];

    path.forEach(p => {
      if (!currentNode.children[p]) {
        throw new Error('Cannot find given item at given path');
      }

      parentStack.push({
        node: currentNode,
        childKey: p
      });

      currentNode = currentNode.children[p];
    });

    if (!contains(item, currentNode.values)) {
      throw new Error('Cannot find given item at given path');
    }

    currentNode.values = reject(v => v === item, currentNode.values);

    // remove empty nodes
    // to avoid memory leak
    while (parentStack.length > 0) {
      const { node, childKey } = parentStack.pop();

      if (!isEmptyNode(node.children[childKey])) {
        break;
      }

      delete node.children[childKey];
    }
  }
}
