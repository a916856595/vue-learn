<template>
  <div>
    <p>
      <span>bus1组件</span>
      <input type="button" @click="emitEvent" value="点击发送事件给Bus2">
    </p>
    <p>
      <span>准备传递给Bus2的值</span>
      <input type="text" v-model="valueToBus2">
    </p>
    <p>
      <span>接收到的来自bus2的值：</span>
      <span v-text="valueFromBus2"></span>
    </p>
  </div>
</template>

<script>
export default {
  name: 'bus1',
  data: function () {
    return {
      valueFromBus2: '',
      valueToBus2: ''
    }
  },
  computed: {
    
  },
  methods: {
    emitEvent: function () {
      this.$bus.emit('eventFromBus1', this.valueToBus2);
    },
    listenBus2Event (value) {
      this.valueFromBus2 = value;
      console.log('接收来自bus2的值');
    }
  },
  mounted: function() {

  },
  created () {
    this.$bus.on('eventFromBus2', this.listenBus2Event);
  },
  beforeDestroy () {
    this.$bus.off('eventFromBus2', this.listenBus2Event);
  }
}
</script>