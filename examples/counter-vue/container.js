import Vue from 'vue';
import { createStore } from 'modulajs'; // eslint-disable-line

/**
 * This container is a convenient helper to pair a vue component and a modulajs
 * model.
 *
 * It's expected to keep only one container at root level of the vue app, with
 * "root" component and "root" model specified. Models other than root model
 * could be designed as its child model or descendant models, then passed down
 * with component props.
 */
const Container = Vue.component('container', {
  props: {
    Component: {
      type: Object,
      required: true
    },
    Model: {
      type: Function,
      required: true
    }
  },

  data() {
    // Create a ModulaJS store to hold state in the decorated model
    this.__store = createStore(this.Model);

    return Object.assign({}, {
      state: this.__store.getState(),
      __store_unsubscribe: undefined
    });
  },

  beforeMount() {
    // Subscribe to store changing, then notify the listeners
    this.__store_unsubscribe = this.__store.subscribe(this.handleUpdate);
    // Bootstrap the state tree in root model
    this.__store.getState().sendInit();
  },

  destroyed() {
    this.__store_unsubscribe();
    this.__store = null;
  },

  methods: {
    handleUpdate() {
      Object.assign(this.$data, { state: this.__store.getState() });
    }
  },

  render(createElement) {
    return createElement(this.Component, {
      props: {
        model: this.state.get('decoratedModel')
      }
    });
  }
});

export default Container;
