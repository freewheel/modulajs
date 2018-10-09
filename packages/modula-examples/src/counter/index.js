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
const title = 'Counter';
const Description = () => (
  <div>
    <p>
      This classic counter example demonstrates the basic usage of modulajs.
    </p>
    <p>
      With modulajs we use a <strong>Model</strong> to describe a state machine
      and a <strong>Component</strong> to define how we render the model.
    </p>
    <p>
      A model handles many actions. For each action type, we use a send function
      to initiate the change, and a recv function to define how an immutable
      model should respond to an action.
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
