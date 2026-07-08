/**
 * Navigation store — tracks active surface and controller focus state
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useNavigationStore = defineStore('navigation', () => {
  const history = ref<string[]>(['/'])
  const focusPath = ref<string>('')
  const controllerConnected = ref(false)
  const showButtonHints = ref(false)

  const canGoBack = computed(() => history.value.length > 1)

  function push(route: string) {
    history.value.push(route)
  }

  function pop() {
    if (history.value.length > 1) {
      history.value.pop()
      return history.value[history.value.length - 1]
    }
    return '/'
  }

  function setControllerActive(active: boolean) {
    controllerConnected.value = active
    showButtonHints.value = active
  }

  function setFocus(path: string) {
    focusPath.value = path
  }

  return {
    history, focusPath, controllerConnected, showButtonHints,
    canGoBack, push, pop, setControllerActive, setFocus,
  }
})