import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './app.vue';

Vue.use(VueRouter);

const routers = [{
  path: '/a',
  component: (resolve) => require(['./src/a.vue'], resolve)
}, {
  path: '/b',
  component: (resolve) => require(['./src/b.vue'], resolve)
}, {
  path: '*',
  redirect: '/a'
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
  render: h => h(App)
})
