<template>
  <button @click="clickButton">
    <span>点我试试</span>
  </button>
</template>

<script>
export default {
  name: 'test-button',
  methods: {
    clickButton () {
      console.log('点击了按钮')
    }
  }
}
</script>

<style scoped lang="less">
  html {
    button {
      border: 1px solid red;
    }
  }
</style>

