import './style.css';
import './a.less';
import Vue from 'vue';
import App from './app.vue';

new Vue ({
  el: '#app',
  render: h => h(App)
})