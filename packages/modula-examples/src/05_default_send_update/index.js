import fs from 'fs';

import Model from './test_model';
import Component from './test_component';

const sources = {
  'Test Model': fs.readFileSync(`${__dirname}/test_model.js`, 'utf8'),
  'Test Component': fs.readFileSync(`${__dirname}/test_component.js`, 'utf8')
};
const title = 'Default Send Update';

export default {
  title,
  Model,
  Component,
  sources
};
