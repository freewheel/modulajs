import fs from 'fs';

import Model from './todos_model';
import Component from './todos_component';

const sources = {
  'Todos Model': fs.readFileSync(`${__dirname}/todos_model.js`, 'utf8'),
  'Todos Component': fs.readFileSync(`${__dirname}/todos_component.js`, 'utf8')
};
const title = 'Dynamic Action Chain';

const description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'

export default {
  title,
  Model,
  Component,
  description,
  sources
};
