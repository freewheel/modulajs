import fs from 'fs';

import Model from './todos_model';
import Component from './todos_component';

const sources = {
  'Todos Model': fs.readFileSync(`${__dirname}/todos_model.js`, 'utf8'),
  'Todos Component': fs.readFileSync(`${__dirname}/todos_component.js`, 'utf8')
};
const title = 'Dynamic Action Chain';

export default {
  title,
  Model,
  Component,
  sources
};
