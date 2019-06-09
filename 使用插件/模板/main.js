import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './app.vue';
import Vuex from 'vuex';

Vue.use(VueRouter);
Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    count: 0,
    list: [1,20,49,4,8]
  },
  mutations: {
    changeCount (state, value) {
      state.count = value;
    },
    changeCountDelay (state, value) {
      setTimeout(() => {
        state.count = value;
      }, 1000);
    }
  },
  getters: {
    findLessTen: (state) => {
      return state.list.filter( item => item < 10 );
    },
    findLessTenListLength: (state, getter) => {
      return getter.findLessTen.length;
    }
  } 
});

const routers = [{
  path: '/useVuexState',
  component: (resolve) => require(['./src/useVueState.vue'], resolve)
}, {
  path: '/useVuexGetter',
  component: (resolve) => require(['./src/useVuexGetter.vue'], resolve)
}, {
  path: '/useVuexAction',
  component: (resolve) => require(['./src/useVuexAction.vue'], resolve)
}, {
  path: '*',
  redirect: '/useVuexState'
}]
const router = new VueRouter({ routes: routers });
router.beforeEach((to, from, n) => {
  console.log('准备去下个页面');
  n();
});
router.beforeResolve((to, from, n) => {
  console.log('到达下个页面');
  n();
});

new Vue ({
  el: '#app',
  router,
  store,
  render: h => h(App)
});
     