export const OVERRIDE_METHODS_KEY = '__overrideMethods__';
export function overrideMethod(target, propertyName, descriptor) {
  if (!target[OVERRIDE_METHODS_KEY]) {
    target[OVERRIDE_METHODS_KEY] = [];
  }
  target[OVERRIDE_METHODS_KEY].push(propertyName);

  return descriptor;
}

export const OVERRIDE_RECEIVERS_KEY = '__overrideReceivers__';
export function overrideReceiver(target, propertyName, descriptor) {
  if (!target[OVERRIDE_RECEIVERS_KEY]) {
    target[OVERRIDE_RECEIVERS_KEY] = [];
  }
  target[OVERRIDE_RECEIVERS_KEY].push(propertyName);

  return descriptor;
}
