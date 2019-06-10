const install = function (Vue) {
  const bus = new Vue({
    methods: {
      emit (event, ...args) {
        this.$emit(event, ...args);
      },
      on (event, func) {
        this.$on(event, func);
      },
      off (event, func) {
        this.$off(event, func);
      }
    }
  });
  Vue.prototype.$bus = bus;
};

export default install;