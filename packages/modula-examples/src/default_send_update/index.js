import fs from 'fs';
import React from 'react';

import Model from './model';
import Component from './component';

const Description = () => (
  <p>
    This example demonstrates how we can utilize the default model sendUpdate
    function so we don&apos;t have to define send/recv functions for actions
    that only trigger one attribute updates.
  </p>
);

export default {
  Model,
  Component,
  Description,
  title: 'Default sendUpdate',
  slug: 'examples-default-sendupdate',
  sources: {
    Model: fs.readFileSync(`${__dirname}/model.js`, 'utf8'),
    Component: fs.readFileSync(`${__dirname}/component.js`, 'utf8')
  }
};
