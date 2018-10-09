import fs from 'fs';
import React from 'react';

import Model from './counter_list_model';
import Component from './counter_list_component';

const sources = {
  'Counter List Model': fs.readFileSync(
    `${__dirname}/counter_list_model.js`,
    'utf8'
  ),
  'Counter List Component': fs.readFileSync(
    `${__dirname}/counter_list_component.js`,
    'utf8'
  )
};
const title = 'Model Lifecycle';

const Description = () => (
  <div>
    <p>
      Modulajs Model has comprehensive lifecycle support. You can define{' '}
      <strong>modelDidMount</strong>, <strong>modelDidUpdate</strong>,{' '}
      <strong>modelWillUnmount</strong> life cycle hooks on model and they will
      be called given different state change events.
    </p>
    <p>
      This example demonstrate how we can utilize model life cycle hooks to
      trigger additional side effects, which is very useful in building very
      complicated pages.
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
