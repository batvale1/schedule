<template>
  <img :class="['ui-icon']"/>
</template>

<script>
export default {
  props: {
    size: {
      type: String,
      default: 'm',
    },
    bordered: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped>
</style>
