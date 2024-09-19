import { createApp, onMounted } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import VueTippy from 'vue-tippy'

import { initDB } from './idb/idb'

import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/light.css'
import './assets/styles/main.scss'
import './assets/styles/tippy.scss'
import 'material-icons/iconfont/material-icons.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueTippy, {
    directive: 'tippy',
    defaultProps: {
        placement: 'auto-end',
        allowHTML: true,
        theme: 'light'
    }
})

;(async () => {
    try {
        await initDB()
    } catch (error) {
        console.error('Failed to initialize IndexedDB:', error)
    } finally {
        app.mount('#app')
    }
})()
