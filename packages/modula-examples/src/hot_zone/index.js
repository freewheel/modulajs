import fs from 'fs';
import React from 'react';

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
const title = 'Hot Zone';

const Description = () => (
  <div>
    <p>
      By default, modulajs react will re-render everything within a container
      with a top-down approach, this ensures page is always up to date when
      model tree gets updated. This is safe but not likely to be the optimal
      rendering approach, given typical web apps have strong locality zones. For
      example when filling a form, only the form area needs to be re-rendered.
    </p>
    <p>
      To allow accurate rendering optimization, modulajs come with a{' '}
      <strong>hotZone</strong> function, which marks the boundary of the area
      that has strong locality, and the model updates happening within that
      &quot;zone&quot; will only trigger the zone updates instead of whole
      container top-down re-render.
    </p>
    <p>
      This example demonstrate how we could utilize <strong>hotZone</strong> to
      mark the zone that could be rendered locally. To compare the result with
      previous &quot;Counter List&quot; example, please install React chrome
      extension and check its &quot;highlight updates&quot; checkbox, and change
      counter value to see the differences.
    </p>
  </div>
);

export default {
  title,
  Model,
  Component,
  Description,
  sources
};
