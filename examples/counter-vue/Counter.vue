<template>
  <div id="app">
    Clicked: {{ model.get('value') }} times, count is {{ model.getEvenOrOdd() }}.
    <div>
      <button @click="model.sendIncrement">+</button>
      <button @click="model.sendDecrement">-</button>
    </div>
  </div>
</template>

<script>
export default {
  props: ['model']
}
</script>
