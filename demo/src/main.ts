import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import Home from './pages/Home.vue'
import Bootstrap from './pages/Bootstrap.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/bs', component: Bootstrap }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes // short for `routes: routes`
})

createApp(App)
  .use(router)
  .mount('#app')
