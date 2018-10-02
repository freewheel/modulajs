import { forEach } from 'ramda';
import renderExample from './render_example';

import Example00 from './00_create_model';
import Example01 from './01_counter';
import Example02 from './02_counter_list';
import Example03 from './03_dynamic_action_chain';
import Example04 from './04_model_services';
import Example05 from './05_default_send_update';
import Example06 from './06_hot_zone';
import Example07 from './07_when_changed';
import Example08 from './08_class_mixin';
import Example09 from './09_functional_programming';

const examples = [
  Example00,
  Example01,
  Example02,
  Example03,
  Example04,
  Example05,
  Example06,
  Example07,
  Example08,
  Example09
];

forEach(renderExample, examples);
