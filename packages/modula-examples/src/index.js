import renderNav from './render_nav';
import render from './render_content';

import counterExample from './counter';
import counterListExample from './counter_list';
import defaultSendUpdateExample from './default_send_update';
import functionalProgrammingExample from './functional_programming';
import handlingSideEffectsExample from './handling_side_effects';
import modelContextExample from './model_context';
import modelLifecycleExample from './model_lifecycle';
import modelServicesExample from './model_services';
import linkedDataExample from './linked_data';
import classMixinExample from './class_mixin';
import hotZoneExample from './hot_zone';
import createModelExample from './create_model';

import docs from './docs';

const examples = [
  counterExample,
  counterListExample,
  defaultSendUpdateExample,
  functionalProgrammingExample,
  handlingSideEffectsExample,
  modelContextExample,
  modelLifecycleExample,
  modelServicesExample,
  linkedDataExample,
  classMixinExample,
  hotZoneExample,
  createModelExample
];

renderNav(examples, docs);
render(examples, docs);
