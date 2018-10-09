import fs from 'fs';
import React from 'react';

import Model from './counter_model';
import Component from './counter_component';

const sources = {
  'Counter Model': fs.readFileSync(`${__dirname}/counter_model.js`, 'utf8'),
  'Counter Component': fs.readFileSync(
    `${__dirname}/counter_component.js`,
    'utf8'
  )
};

const title = 'Create Model Syntax';

const Description = () => (
  <div>
    <p>
      The alternative legacy way of writing modulajs Model, with{' '}
      <strong>createModel</strong> helper method from modula-create-model
      package.
    </p>
    <p>
      While this will still be supported, the recommended way is to use class
      syntax given its flexibility to support Class Mixin pattern.
    </p>
  </div>
);

export default {
  title,
  Model,
  Component,
  Description,
  sources
};
