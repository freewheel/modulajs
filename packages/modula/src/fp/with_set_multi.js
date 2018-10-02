export default function withSetMulti(fn) {
  return model => {
    const props = model.props();

    return [model.setMulti(fn(props))];
  };
}
