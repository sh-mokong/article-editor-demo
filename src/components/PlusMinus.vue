<template>
  <div>
    <button @click="plus">+</button>
    <button @click="minus">-</button>
    <div>
      count: {{sum}}
    </div>
  </div>
</template>

<script>
import {defineComponent, ref} from 'vue';

export default defineComponent({
  name: 'plusMinus',
  components: {
  },
  props: {
    count: {
      type: Number,
      default: 0
    }
  },
  setup(props) {
    const sum = ref(props.count);
    const plus = () => {
      sum.value = sum.value + 1;
    }
    const minus = () => {
      sum.value = sum.value - 1;
    }
    return {
      plus,
      minus,
      sum
    };
  },
});
</script>
<style scoped>
 button{width:20px;height:10px;margin:2px;padding:5px}
</style>
