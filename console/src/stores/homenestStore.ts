/* ═══════════════════════════════════════════════════════════════════
   HomeNest Console — Zustand Store
   Manages system status, media, automation, TV, and MCP state.
   ═══════════════════════════════════════════════════════════════════ */
import { create } from 'zustand'

// ─── Types ──────────────────────────────────────────────────────

export interface Service {
  name: string
  status: 'running' | 'stopped'
  uptime: string | null
}

export interface SystemStatus {
  version: string
  services: Service[]
  uptime: string
}

export interface MediaItem {
  id: string
  title: string
  media_type: 'video' | 'audio' | 'other'
}

export interface NowPlaying {
  id: string
  title: string
}

export interface EpgChannel {
  id: string
  number: string
  name: string
  current?: { title: string; time: string }
}

export interface Recording {
  id: string
  title: string
  channel: string
  date: string
  duration: string
}

export interface SnackbarMessage {
  message: string
  type: 'info' | 'success' | 'error' | 'warning'
  action?: string
}

// ─── Store Interface ────────────────────────────────────────────

interface HomenestState {
  // System
  systemStatus: SystemStatus
  loading: boolean
  error: string | null

  // Media
  nowPlaying: NowPlaying | null
  mediaList: MediaItem[]
  isPlaying: boolean

  // Automation
  activeScenes: string[]
  recentActions: { action: string; description?: string; timestamp?: string; status?: string }[]
  availableScenes: string[]

  // TV
  epgChannels: EpgChannel[]
  recordings: Recording[]
  liveChannel: string | null

  // UI
  sidebarCollapsed: boolean
  snackbar: SnackbarMessage | null

  // Actions
  connectMcp: () => Promise<void>
  playMedia: (mediaId: string) => Promise<void>
  pauseMedia: () => Promise<void>
  resumeMedia: () => Promise<void>
  stopMedia: () => Promise<void>
  listMedia: (path?: string) => Promise<void>
  triggerScene: (scene: string) => Promise<void>
  getAutomationStatus: () => Promise<void>
  getEpg: (channel?: string) => Promise<void>
  getRecordings: () => Promise<void>
  tuneChannel: (channel: string | null) => Promise<void>
  recordChannel: (channel: string, duration: number) => Promise<void>
  toggleSidebar: () => void
  showSnackbar: (msg: SnackbarMessage) => void
  dismissSnackbar: () => void
}

// ─── Store Implementation ───────────────────────────────────────

export const useHomenestStore = create<HomenestState>((set, get) => ({
  // ─── Initial State ────────────────────────────────────────────
  systemStatus: {
    version: '0.1.0',
    services: [],
    uptime: '0h 0m',
  },
  loading: false,
  error: null,

  nowPlaying: null,
  mediaList: [],
  isPlaying: false,

  activeScenes: [],
  recentActions: [],
  availableScenes: ['goodnight', 'morning', 'away'],

  epgChannels: [],
  recordings: [],
  liveChannel: null,

  sidebarCollapsed: false,
  snackbar: null,

  // ─── MCP Connection ───────────────────────────────────────────
  connectMcp: async () => {
    set({ loading: true, error: null })
    try {
      const resp = await fetch('/api/status')
      if (resp.ok) {
        const data = await resp.json()
        set({ systemStatus: data })
      }
    } catch {
      // Socket not available — use defaults
      set({
        systemStatus: {
          version: '0.1.0',
          services: [
            { name: 'homenest-mcp', status: 'running', uptime: '0:05:30' },
            { name: 'media-server', status: 'running', uptime: null },
            { name: 'home-assistant', status: 'stopped', uptime: null },
            { name: 'feed-spool', status: 'running', uptime: '1:15:00' },
          ],
          uptime: '2h 30m',
        },
      })
    } finally {
      set({ loading: false })
    }
  },

  // ─── Media Actions ────────────────────────────────────────────
  playMedia: async (mediaId) => {
    set({ isPlaying: true, nowPlaying: { id: mediaId, title: mediaId } })
  },

  pauseMedia: async () => {
    set({ isPlaying: false })
  },

  resumeMedia: async () => {
    set({ isPlaying: true })
  },

  stopMedia: async () => {
    set({ isPlaying: false, nowPlaying: null })
  },

  listMedia: async (_path) => {
    // Simulated — wire to MCP
    set({
      mediaList: [
        { id: 'm1', title: 'Big Buck Bunny', media_type: 'video' },
        { id: 'm2', title: 'Tears of Steel', media_type: 'video' },
        { id: 'm3', title: 'Sintel', media_type: 'video' },
        { id: 'm4', title: 'Classical Mix', media_type: 'audio' },
        { id: 'm5', title: 'Jazz Session', media_type: 'audio' },
        { id: 'm6', title: 'Nature Documentary', media_type: 'video' },
      ],
    })
  },

  // ─── Automation Actions ───────────────────────────────────────
  triggerScene: async (scene) => {
    const { activeScenes } = get()
    if (!activeScenes.includes(scene)) {
      set({ activeScenes: [...activeScenes, scene] })
    }
  },

  getAutomationStatus: async () => {
    // Simulated
    set({
      recentActions: [
        { action: 'Scene triggered', description: 'goodnight', timestamp: '2 min ago', status: 'completed' },
        { action: 'Media paused', description: 'Big Buck Bunny', timestamp: '5 min ago', status: 'completed' },
      ],
    })
  },

  // ─── TV Actions ───────────────────────────────────────────────
  getEpg: async (_channel) => {
    set({
      epgChannels: [
        { id: 'ch1', number: '1', name: 'ABC', current: { title: 'News at 7', time: '19:00' } },
        { id: 'ch2', number: '2', name: 'SBS', current: { title: 'World News', time: '19:30' } },
        { id: 'ch3', number: '3', name: 'Seven', current: { title: 'Movie Night', time: '20:00' } },
        { id: 'ch4', number: '4', name: 'Nine', current: { title: 'The Block', time: '19:30' } },
        { id: 'ch5', number: '5', name: 'Ten', current: { title: 'MasterChef', time: '19:30' } },
      ],
    })
  },

  getRecordings: async () => {
    set({
      recordings: [
        { id: 'r1', title: 'News at 7', channel: 'ABC', date: '2026-06-08', duration: '30 min' },
        { id: 'r2', title: 'Movie Night', channel: 'Seven', date: '2026-06-07', duration: '2h' },
      ],
    })
  },

  tuneChannel: async (channel) => {
    set({ liveChannel: channel })
  },

  recordChannel: async (_channel, _duration) => {
    // TODO: Wire to MCP
  },

  // ─── UI Actions ───────────────────────────────────────────────
  toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  showSnackbar: (msg) => {
    set({ snackbar: msg })
    setTimeout(() => set({ snackbar: null }), 4000)
  },

  dismissSnackbar: () => set({ snackbar: null }),
}))
