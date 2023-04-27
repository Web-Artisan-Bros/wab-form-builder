import { createApp } from 'vue'
import PortalVue from 'portal-vue'
import App from './App.vue'
import PrimeVue from 'primevue/config'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'

import 'primeflex/primeflex.css'
import 'primeflex/themes/arya-blue.css'

import 'primevue/resources/themes/lara-light-indigo/theme.css'
import 'primevue/resources/primevue.min.css'

import './assets/main.css'

createApp(App)
  .use(PrimeVue)
  .use(PortalVue)
  .component('Button', Button)
  .component('InputText', InputText)
  .component('Password', Password)
  .mount('#app')
