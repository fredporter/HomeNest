/**
 * Controller-first input composable — Web Gamepad API + keyboard dpad emulation + Snackbar bridge.
 * Provides spatial focus navigation for 10-foot console surfaces.
 *
 * Arrow keys / dpad move focus between focusable elements within a surface.
 * A/Enter = activate (click), B/Escape = back, X = info, Y = menu.
 *
 * Snackbar bridge (optional): connects to uCore Snackbar at ws://localhost:8484/controller
 * for OS-level gamepad events when available. Falls back gracefully to keyboard-only nav.
 */
import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import { useRouter } from 'vue-router'
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
}

export function useController() {
  const router = useRouter()
  const nav = useNavigationStore()
  const gamepadActive = ref(false)
  const gamepadIndex = ref<number | null>(null)
  const prevState = ref<GamepadState>(emptyState())
  const focusIndex = ref(0)

  let animationFrame: number | null = null
  let snackbarWs: WebSocket | null = null

  function emptyState(): GamepadState {
    return {
      dpadUp: false, dpadDown: false, dpadLeft: false, dpadRight: false,
      a: false, b: false, x: false, y: false,
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
    }
  }

  // ── Snackbar controller bridge (uCore) ──────────────────────

  function connectSnackbar() {
    try {
      snackbarWs = new WebSocket('ws://localhost:8484/controller')
      snackbarWs.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'gamepad') {
            handleSnackbarInput(data)
          }
        } catch { /* ignore malformed messages */ }
      }
      snackbarWs.onopen = () => {
        nav.setControllerActive(true)
        gamepadActive.value = true
      }
      snackbarWs.onclose = () => {
        nav.setControllerActive(false)
        gamepadActive.value = false
      }
      snackbarWs.onerror = () => {
        // Snackbar not available — fall back to keyboard
      }
    } catch {
      // WebSocket not supported or Snackbar not running
    }
  }

  function handleSnackbarInput(data: Record<string, unknown>) {
    const input = data.input as Record<string, boolean> | undefined
    if (!input) return
    if (input.dpadUp) moveFocus(0, -1)
    if (input.dpadDown) moveFocus(0, 1)
    if (input.dpadLeft) moveFocus(-1, 0)
    if (input.dpadRight) moveFocus(1, 0)
    if (input.a) activateFocused()
    if (input.b) router.back()
  }

  // ── focusable element query ──────────────────────────────────

  function getFocusableElements(): HTMLElement[] {
    const selectors = [
      'button:not([disabled])',
      '.hn-launcher__tile',
      '.hn-poster-card',
      '.hn-tv-guide__program',
      '.usx-card[style*="cursor: pointer"]',
      '.usx-tab',
      'input:not([type="hidden"])',
      '.hn-poster-card button',
    ]
    const els = document.querySelectorAll(selectors.join(','))
    return Array.from(els).filter(
      (el) => {
        const htmlEl = el as HTMLElement
        const style = window.getComputedStyle(htmlEl)
        return (
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          style.opacity !== '0' &&
          htmlEl.offsetParent !== null
        )
      },
    ) as HTMLElement[]
  }

  function focusElement(index: number) {
    const els = getFocusableElements()
    if (els.length === 0) return
    const wrapped = ((index % els.length) + els.length) % els.length
    els.forEach((el) => el.classList.remove('hn-controller-focus'))
    const target = els[wrapped]
    target.classList.add('hn-controller-focus')
    target.focus({ preventScroll: false })
    target.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    focusIndex.value = wrapped
  }

  function activateFocused() {
    const els = getFocusableElements()
    if (els.length === 0) return
    const idx = ((focusIndex.value % els.length) + els.length) % els.length
    const el = els[idx]
    el.click()
  }

  // ── directional navigation in a 2D grid ─────────────────────

  function moveFocus(dx: number, dy: number) {
    const els = getFocusableElements()
    if (els.length === 0) return
    const current = ((focusIndex.value % els.length) + els.length) % els.length
    const currentEl = els[current]
    const currentRect = currentEl.getBoundingClientRect()
    const cx = currentRect.left + currentRect.width / 2
    const cy = currentRect.top + currentRect.height / 2

    let bestIdx = current
    let bestScore = Infinity

    for (let i = 0; i < els.length; i++) {
      if (i === current) continue
      const rect = els[i].getBoundingClientRect()
      const ex = rect.left + rect.width / 2
      const ey = rect.top + rect.height / 2
      const ddx = ex - cx
      const ddy = ey - cy

      if (dx > 0 && ddx <= 0) continue
      if (dx < 0 && ddx >= 0) continue
      if (dy > 0 && ddy <= 0) continue
      if (dy < 0 && ddy >= 0) continue

      const dist = Math.sqrt(ddx * ddx + ddy * ddy)
      const score = dist * 2 + Math.abs(dx !== 0 ? ddy : ddx) * 3
      if (score < bestScore) {
        bestScore = score
        bestIdx = i
      }
    }

    if (bestIdx !== current) {
      focusIndex.value = bestIdx
      focusElement(bestIdx)
    }
  }

  // ── poll loop ────────────────────────────────────────────────

  function poll() {
    const current = readGamepad()
    if (current.dpadUp && !prevState.value.dpadUp) moveFocus(0, -1)
    if (current.dpadDown && !prevState.value.dpadDown) moveFocus(0, 1)
    if (current.dpadLeft && !prevState.value.dpadLeft) moveFocus(-1, 0)
    if (current.dpadRight && !prevState.value.dpadRight) moveFocus(1, 0)
    if (current.a && !prevState.value.a) activateFocused()
    if (current.b && !prevState.value.b) router.back()
    prevState.value = current
    animationFrame = requestAnimationFrame(poll)
  }

  function onGamepadConnected(e: GamepadEvent) {
    gamepadIndex.value = e.gamepad.index
    gamepadActive.value = true
    nav.setControllerActive(true)
    poll()
  }

  function onGamepadDisconnected(_e: GamepadEvent) {
    gamepadActive.value = false
    gamepadIndex.value = null
    nav.setControllerActive(false)
    if (animationFrame) cancelAnimationFrame(animationFrame)
  }

  function handleGamepadInput(_e: Event) {}

  // ── keyboard dpad emulation ──────────────────────────────────

  function onKeydown(e: KeyboardEvent) {
    if (
      document.activeElement?.tagName === 'INPUT' ||
      document.activeElement?.tagName === 'TEXTAREA'
    ) return

    switch (e.key) {
      case 'ArrowUp': moveFocus(0, -1); break
      case 'ArrowDown': moveFocus(0, 1); break
      case 'ArrowLeft': moveFocus(-1, 0); break
      case 'ArrowRight': moveFocus(1, 0); break
      case 'Enter': activateFocused(); break
      case 'Escape':
      case 'Backspace': {
        const back = nav.pop()
        router.push(back)
        break
      }
      case 'm': router.push('/media'); break
      case 't': router.push('/tv'); break
      case 'a': router.push('/automation'); break
      case 's': router.push('/settings'); break
      case 'h': router.push('/'); break
    }
  }

  onMounted(() => {
    window.addEventListener('gamepadconnected', onGamepadConnected)
    window.addEventListener('gamepaddisconnected', onGamepadDisconnected)
    window.addEventListener('keydown', onKeydown)
    setTimeout(() => focusElement(0), 300)
    connectSnackbar()
  })

  onUnmounted(() => {
    window.removeEventListener('gamepadconnected', onGamepadConnected)
    window.removeEventListener('gamepaddisconnected', onGamepadDisconnected)
    window.removeEventListener('keydown', onKeydown)
    if (animationFrame) cancelAnimationFrame(animationFrame)
    if (snackbarWs) snackbarWs.close()
  })

  return { gamepadActive, handleGamepadInput }
}