import { createApp } from 'vue'
import PortalVue from 'portal-vue'
import App from './App.vue'
import PrimeVue from 'primevue/config'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import MultiSelect from 'primevue/multiselect';
import Chips from 'primevue/chips';
import Dropdown from 'primevue/dropdown';


import 'primeflex/primeflex.css'
import 'primeflex/themes/arya-blue.css'

import 'primevue/resources/themes/lara-light-indigo/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css';


import './assets/main.css'

createApp(App)
  .use(PrimeVue)
  .use(PortalVue)
  .component('Button', Button)
  .component('InputText', InputText)
  .component('Password', Password)
  .component('MultiSelect', MultiSelect)
  .component('Chips', Chips)
  .component('Dropdown', Dropdown)
  .mount('#app')
