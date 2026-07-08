/**
 * Controller-first input composable — Web Gamepad API + keyboard dpad emulation
 * Provides reactive gamepad state for 10-foot console navigation.
 */
import { ref, onMounted, onUnmounted } from 'vue'
import { useNavigationStore } from '@/stores/navigation'

interface GamepadState {
  dpadUp: boolean
  dpadDown: boolean
  dpadLeft: boolean
  dpadRight: boolean
  a: boolean
  b: boolean
  x: boolean
  y: boolean
  lb: boolean
  rb: boolean
  start: boolean
  select: boolean
}

export function useController() {
  const nav = useNavigationStore()
  const gamepadActive = ref(false)
  const gamepadIndex = ref<number | null>(null)
  const prevState = ref<GamepadState>(emptyState())

  let animationFrame: number | null = null

  function emptyState(): GamepadState {
    return {
      dpadUp: false, dpadDown: false, dpadLeft: false, dpadRight: false,
      a: false, b: false, x: false, y: false,
      lb: false, rb: false, start: false, select: false,
    }
  }

  function readGamepad(): GamepadState {
    const gamepads = navigator.getGamepads()
    const gp = gamepads[gamepadIndex.value ?? 0]
    if (!gp) return emptyState()

    return {
      dpadUp: gp.buttons[12]?.pressed ?? false,
      dpadDown: gp.buttons[13]?.pressed ?? false,
      dpadLeft: gp.buttons[14]?.pressed ?? false,
      dpadRight: gp.buttons[15]?.pressed ?? false,
      a: gp.buttons[0]?.pressed ?? false,
      b: gp.buttons[1]?.pressed ?? false,
      x: gp.buttons[2]?.pressed ?? false,
      y: gp.buttons[3]?.pressed ?? false,
      lb: gp.buttons[4]?.pressed ?? false,
      rb: gp.buttons[5]?.pressed ?? false,
      start: gp.buttons[9]?.pressed ?? false,
      select: gp.buttons[8]?.pressed ?? false,
    }
  }

  function poll() {
    const current = readGamepad()

    // Edge-triggered: only fire on press (not hold)
    if (current.dpadUp && !prevState.value.dpadUp) console.log('[Gamepad] DPad Up')
    if (current.dpadDown && !prevState.value.dpadDown) console.log('[Gamepad] DPad Down')
    if (current.dpadLeft && !prevState.value.dpadLeft) console.log('[Gamepad] DPad Left')
    if (current.dpadRight && !prevState.value.dpadRight) console.log('[Gamepad] DPad Right')
    if (current.a && !prevState.value.a) console.log('[Gamepad] A — Select')
    if (current.b && !prevState.value.b) console.log('[Gamepad] B — Back')
    if (current.x && !prevState.value.x) console.log('[Gamepad] X — Info')
    if (current.y && !prevState.value.y) console.log('[Gamepad] Y — Menu')

    prevState.value = current
    animationFrame = requestAnimationFrame(poll)
  }

  function onGamepadConnected(e: GamepadEvent) {
    gamepadIndex.value = e.gamepad.index
    gamepadActive.value = true
    nav.setControllerActive(true)
    console.log('[Gamepad] Connected:', e.gamepad.id)
    poll()
  }

  function onGamepadDisconnected(_e: GamepadEvent) {
    gamepadActive.value = false
    gamepadIndex.value = null
    nav.setControllerActive(false)
    if (animationFrame) cancelAnimationFrame(animationFrame)
    console.log('[Gamepad] Disconnected')
  }

  function handleGamepadInput(_e: Event) {
    // Custom event handler placeholder for gamepad-driven navigation
  }

  onMounted(() => {
    window.addEventListener('gamepadconnected', onGamepadConnected)
    window.addEventListener('gamepaddisconnected', onGamepadDisconnected)
  })

  onUnmounted(() => {
    window.removeEventListener('gamepadconnected', onGamepadConnected)
    window.removeEventListener('gamepaddisconnected', onGamepadDisconnected)
    if (animationFrame) cancelAnimationFrame(animationFrame)
  })

  return { gamepadActive, handleGamepadInput }
}