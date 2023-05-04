import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import Home from './pages/Home.vue'

const routes = [
  { path: '/', component: Home }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes // short for `routes: routes`
})

createApp(App)
  .use(router)
  .mount('#app')
