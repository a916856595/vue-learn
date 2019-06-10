<template>
  <div>
    <p>
      <span>bus2组件</span>
    </p>
    <p>
      <span>接收到的来自bus1的值：</span>
      <span v-text="valueFromBus1"></span>
    </p>
  </div>
</template>

<script>
export default {
  name: 'bus2',
  data: function () {
    return {
      valueFromBus1: ''
    }
  },
  computed: {
    
  },
  methods: {
    listenBus1Event (value) {
      this.valueFromBus1 = value;
      console.log('接收来自bus1的值')
      this.$bus.emit('eventFromBus2', this.valueFromBus1);
    }
  },
  mounted: function() {

  },
  created () {
    this.$bus.on('eventFromBus1', this.listenBus1Event);
  },
  beforeDestroy () {
    this.$bus.off('eventFromBus1', this.listenBus1Event);
  }
}
</script>