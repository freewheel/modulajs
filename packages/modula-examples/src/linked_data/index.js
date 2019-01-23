import fs from 'fs';
import React from 'react';

import Model from './book_detail_expo_model';
import Component from './book_detail_expo_component';

const Description = () => (
  <div>
    <p>
      Modula is designed to support a deep hierarchy of components, which
      results in typical component designing with a strong data locality
      assumption, and that is good for reusability.
    </p>
    <p>
      This design pattern however makes it not as intuitive to share data cross
      components. In this example we'll utilize a model lifecycle event{' '}
      <strong>modelWillUpdate</strong> to keep multiple copies of the same data
      in sync.
    </p>
    <p>
      In this extreme example, we can update the same 'book' data from 3 modula
      models, while in reality we can usually identify one data copy as the
      "golden" copy thus the reconciliation logic can be simpler.
    </p>
    <p>
      Try click on 'like' buttons on different components and see how they are
      automatically synced. And notice every a few seconds the likes will jump
      up for 10 which is triggered by the parent expo model.
    </p>
  </div>
);

export default {
  Model,
  Component,
  Description,
  title: 'Linked Data',
  slug: 'examples-linked-data',
  sources: {
    'Book Detail Expo Model': fs.readFileSync(
      `${__dirname}/book_detail_expo_model.js`,
      'utf8'
    ),
    'Book Detail Expo Component': fs.readFileSync(
      `${__dirname}/book_detail_expo_component.js`,
      'utf8'
    ),
    'Book Detail V2018 Model': fs.readFileSync(
      `${__dirname}/book_detail_v2018_model.js`,
      'utf8'
    ),
    'Book Detail V2018 Component': fs.readFileSync(
      `${__dirname}/book_detail_v2018_component.js`,
      'utf8'
    ),
    'Book Detail V2019 Model': fs.readFileSync(
      `${__dirname}/book_detail_v2019_model.js`,
      'utf8'
    ),
    'Book Detail V2019 Component': fs.readFileSync(
      `${__dirname}/book_detail_v2019_component.js`,
      'utf8'
    )
  }
};
