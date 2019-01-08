import React from 'react';

export default ({ model }) => (
  <dl>
    <dt>{model.get('name')}</dt>
    <dd>
      <button
        className="btn btn-primary"
        // model will have a default sendUpdate function
        // you can use to update one attribute
        onClick={() => model.sendUpdate('name', 'new')}
      >
        Update Name
      </button>
    </dd>
  </dl>
);
