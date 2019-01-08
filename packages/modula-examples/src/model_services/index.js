import fs from 'fs';
import React from 'react';

import Model from './service_model';
import Component from './service_component';

const Description = () => (
  <div>
    <p>
      Models are immutable. But in some cases, we need to track of something
      volatile such as the handler of an interval or some other states that
      isn&apos;t suitable to be a part of the model, like cache etc. With
      modulajs, we use Model Services to support such use cases elegantly.
    </p>
    <p>
      One pretty common use case for Model Services is some background checks
      that need to be run in certain intervals, like checking inbox messages.
    </p>
    <p>
      This example demonstrates how we can create a service and attach it to a
      modulajs Model, and how we can interact with those volatile state that is
      maintained in Services.
    </p>
  </div>
);

export default {
  Model,
  Component,
  Description,
  title: 'Model Services',
  slug: 'examples-model-services',
  sources: {
    'Service Model': fs.readFileSync(`${__dirname}/service_model.js`, 'utf8'),
    'Service Component': fs.readFileSync(
      `${__dirname}/service_component.js`,
      'utf8'
    )
  }
};
