import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'

import '@/styles/index.scss'
import '@/icons/index.css'
import '@/permission'
import '@/widgets/element-ui'

new Vue({
  el: '#app',
  router,
  store,
  render: (h) => h(App),
})
