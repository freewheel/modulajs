import React from 'react';

const Component = ({ model }) =>
  model.get('time') ? (
    <div>
      <h5>{model.get('time')}</h5>
      <p>Updated {model.getService('time').getCount()} Times</p>
    </div>
  ) : (
    <p>Loading latest time...</p>
  );

export default Component;
