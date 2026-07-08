/**
 * HomeNest Console — Vue 3 entry point
 * 10-foot media + automation control surface
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'

// CSS imports in layer order: PicoCSS base → USX tokens → theme → standard → home-nest
import '@picocss/pico'
import '../../packages/usx-tokens/tokens/tokens-color.css'
import '../../packages/usx-tokens/tokens/tokens-components.css'
import '../../packages/usx-tokens/tokens/tokens-spacing.css'
import '../../packages/usx-tokens/tokens/tokens-touch.css'
import '../../packages/usx-tokens/tokens/tokens-typography.css'
import '../../packages/usx-tokens/themes/dark.css'
import '../../packages/usx-tokens/usx-standard.css'
import '../../packages/usx-tokens/home-nest/console-grid.css'
import '../../packages/usx-tokens/home-nest/controller-focus.css'
import '../../packages/usx-tokens/home-nest/media-player.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')