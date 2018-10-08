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

const description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'

export default {
  title,
  Model,
  Component,
  description,
  sources
};
