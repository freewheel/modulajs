import fs from 'fs';

import Model from './app_model';
import Component from './app_component';

const sources = {
  'App Model': fs.readFileSync(`${__dirname}/app_model.js`, 'utf8'),
  'App Component': fs.readFileSync(`${__dirname}/app_component.js`, 'utf8')
};
const title = 'Model Services';

export default {
  title,
  Model,
  Component,
  sources
};
