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

    <p>
      <span>mutations里如果包含异步操作可以正常更新state，但无法得知state何时更新完成</span>
      <button @click="changeCountDelay">使用mutations同步newCount到count</button>
    </p>
    <p>
      <span>actions中可以知道state何时更新完成</span>
      <button @click="changeCountDelayUseAction">使用actions同步newCount到count</button>
    </p>
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
    },
    changeCountDelayUseAction () {
      var _this = this;
      _this.$store.dispatch('changeCountDelayWithDelay', { value: _this.newCount }).then(() => {
        console.log('更新完成');
      })
    }
  },
  mounted () {
    this.newCount = this.count;
  }
}
</script>