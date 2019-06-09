<template>
  <div>
    <p>
      <span>当前count的值：</span>
      <span v-text="count"></span>
    </p>
    <p>
      <span>填入newCount的值：</span>
      <input type="text" v-model="newCount">
    </p>

    <button @click="changeCountDelay">点击延迟一秒同步newCount到count</button>
  </div>
</template>

<script>
export default {
  data () {
    return {
      newCount: 0
    }
  },
  computed: {
    count () {
      return this.$store.state.count;
    }
  },
  methods: {
    changeCountDelay () {
      var _this = this;
      _this.$store.commit('changeCountDelay', _this.newCount);
    }
  },
  mounted () {
    this.newCount = this.count;
  }
}
</script>