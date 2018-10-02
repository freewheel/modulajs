export default function withSet(key, fn) {
  return model => [model.set(key, fn)];
}
