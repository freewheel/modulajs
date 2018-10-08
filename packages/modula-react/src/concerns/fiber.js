// For some general information about fiber we can refer to
// https://github.com/acdlite/react-fiber-architecture#return
export function isAncestor(fromFiber, toFiber) {
  if (fromFiber === toFiber) {
    return false;
  }

  let currentNode = toFiber;

  // go up until there's no return fiber
  while (currentNode !== null) {
    if (currentNode === fromFiber) {
      return true;
    }

    currentNode = currentNode.return;
  }

  return false;
}

export function isDesendant(fromFiber, toFiber) {
  if (fromFiber === toFiber) {
    return false;
  }

  return isAncestor(toFiber, fromFiber);
}
