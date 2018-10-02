import fs from 'fs';

import Model from './user_list_model';
import Component from './user_list_component';

const sources = {
  'User List Model': fs.readFileSync(`${__dirname}/user_list_model.js`, 'utf8'),
  'User List Mixins': fs.readFileSync(
    `${__dirname}/user_list_mixins.js`,
    'utf8'
  ),
  'User List Component': fs.readFileSync(
    `${__dirname}/user_list_component.js`,
    'utf8'
  )
};
const title = 'Class Mixins';

export default {
  title,
  Model,
  Component,
  sources
};
