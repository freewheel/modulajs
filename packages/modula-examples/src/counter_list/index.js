import fs from 'fs';
import React from 'react';

import Model from './counter_list_model';
import Component from './counter_list_component';

const Description = () => (
  <div>
    <p>
      This counter list example demonstrates how we can build a more complicated
      model/component reusing existing modulajs models/components.
    </p>
  </div>
);

export default {
  Model,
  Component,
  Description,
  title: 'Counter List',
  slug: 'examples-counter-list',
  sources: {
    'Counter List Model': fs.readFileSync(
      `${__dirname}/counter_list_model.js`,
      'utf8'
    ),
    'Counter List Component': fs.readFileSync(
      `${__dirname}/counter_list_component.js`,
      'utf8'
    )
  }
};
