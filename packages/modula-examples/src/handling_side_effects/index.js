import fs from 'fs';
import React from 'react';

import Model from './todos_model';
import Component from './todos_component';

const Description = () => (
  <div>
    <p>
      Side effects are additional things that you would like them to happen
      after updating model itself.
    </p>
    <p>
      For example you can render a reporting page with mostly empty tables and
      then kick off additional AJAX loading for each of those tables.
    </p>
    <p>
      This example demonstrates how we returns additional side effects when
      doing update for an action.
    </p>
  </div>
);

export default {
  Model,
  Component,
  Description,
  title: 'Handling Side Effects',
  slug: 'examples-handling-side-effects',
  sources: {
    'Todos Model': fs.readFileSync(`${__dirname}/todos_model.js`, 'utf8'),
    'Todos Component': fs.readFileSync(
      `${__dirname}/todos_component.js`,
      'utf8'
    )
  }
};
