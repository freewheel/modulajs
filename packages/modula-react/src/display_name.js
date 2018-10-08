export function getDisplayName(component) {
  return component.constructor.displayName || component.constructor.name;
}

export function wrapDisplayName(component, prefix) {
  return `${prefix}(${getDisplayName(component)})`;
}
