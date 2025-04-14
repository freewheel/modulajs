import Vue from 'vue';
import Container from './container';
import Counter from './Counter.vue';
import { CounterModel } from './counter_model';

const vue = new Vue({
  el: '#app',
  render: h => h(Container, {
    props: {
      Component: Counter,
      Model: CounterModel
    }
  })
});

export default vue;
