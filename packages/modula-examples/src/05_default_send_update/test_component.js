import React from 'react';

export default ({ model }) => (
  <dl>
    <dt>{model.get('name')}</dt>
    <dd>
      <button
        className="btn btn-primary"
        onClick={() => model.sendUpdate('name', 'new')}
      >
        Update Name
      </button>
    </dd>
  </dl>
);
