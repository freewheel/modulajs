import fs from 'fs';
import React from 'react';

import Model from './context_model';
import Component from './context_component';

const sources = {
  'Context Model': fs.readFileSync(`${__dirname}/context_model.js`, 'utf8'),
  'Context Component': fs.readFileSync(
    `${__dirname}/context_component.js`,
    'utf8'
  )
};
const title = 'Model Context';

const Description = () => (
  <div>
    <p>
      Since modula models are nested, frequently we see pattern that child
      models will ask for general informations such as current logged in user,
      global translation etc. In those scenarios, passing down functions layer
      by layer is painful.
    </p>
    <p>
      To address the issue, modulajs Model have a mechanism called Context which
      can help us access global available functions from a deeply nested child
      model.
    </p>
    <p>
      This example demonstrates how to consume context from one of its ancestor
      model, as well as to build a context provider model.
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
