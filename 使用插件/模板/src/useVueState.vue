<template>
  <div>
    <span v-text="count"></span>
    <input type="text" @input="changeCount" v-model="newCount">
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      newCount: 0
    }
  },
  computed: {
    count: function() {
      return this.$store.state.count;
    }
  },
  methods: {
    changeCount: function () {
      this.$store.commit('changeCount', this.newCount);
    }
  },
  mounted: function() {
    this.newCount = this.count;
  }
}
</script>