import fs from 'fs';
import React from 'react';

import Model from './user_list_model';
import Component from './user_list_component';

const Description = () => (
  <div>
    <p>
      For typical enterprise use cases, we see a lot of similar patterns. Those
      patterns looks pretty reusable, but still the interrelationships between
      them are highly chaotic. A better approach is to maintain those states
      within one single layer other than leaving them in nested child models.
    </p>
    <p>
      Class mixins are an experimental approach that allows us to reuse certain
      patterns, while still preserving the flexibility of weaving additional
      behaviors to the pattern.
    </p>
    <p>
      This example demonstrates how we can reuse predefined sort and pagination
      mixin and build a user list on top of them.
    </p>
  </div>
);

export default {
  Model,
  Component,
  Description,
  title: 'Class Mixins',
  slug: 'examples-class-mixins',
  sources: {
    'User List Model': fs.readFileSync(
      `${__dirname}/user_list_model.js`,
      'utf8'
    ),
    'User List Mixins': fs.readFileSync(
      `${__dirname}/user_list_mixins.js`,
      'utf8'
    ),
    'User List Component': fs.readFileSync(
      `${__dirname}/user_list_component.js`,
      'utf8'
    ),
    'User Query': fs.readFileSync(`${__dirname}/user_query.js`, 'utf8')
  }
};
