import fs from 'fs';

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

const title = 'Counter List';

export default {
  title,
  Model,
  Component,
  sources
};
