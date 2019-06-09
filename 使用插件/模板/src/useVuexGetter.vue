<template>
  <div>
    <span>定义在store中数组小于10的集合：</span>
    <span v-text="list"></span>
    <p>
      <span>集合的长度：</span>
      <span v-text="length"></span>
    </p>
  </div>
</template>

<script>
export default {
  computed: {
    list () {
      return this.$store.getters.findLessTen;
    },
    length () {
      return this.$store.getters.findLessTenListLength;
    }
  }
}
</script>