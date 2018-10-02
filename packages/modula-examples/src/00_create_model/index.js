import fs from 'fs';

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

export default {
  title,
  Model,
  Component,
  sources
};
