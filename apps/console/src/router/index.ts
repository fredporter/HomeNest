/**
 * HomeNest Console — Vue Router
 * 10-foot controller-first surface routes
 */
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'launcher',
    component: () => import('@/surfaces/LauncherSurface.vue'),
    meta: { title: 'HomeNest', icon: 'home' },
  },
  {
    path: '/media',
    name: 'media',
    component: () => import('@/surfaces/MediaBrowserSurface.vue'),
    meta: { title: 'Media Library', icon: 'movie' },
  },
  {
    path: '/tv',
    name: 'tv',
    component: () => import('@/surfaces/TvGuideSurface.vue'),
    meta: { title: 'TV Guide', icon: 'live_tv' },
  },
  {
    path: '/now-playing',
    name: 'now-playing',
    component: () => import('@/surfaces/NowPlayingSurface.vue'),
    meta: { title: 'Now Playing', icon: 'play_circle' },
  },
  {
    path: '/automation',
    name: 'automation',
    component: () => import('@/surfaces/AutomationSurface.vue'),
    meta: { title: 'Automation', icon: 'bolt' },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/surfaces/SettingsSurface.vue'),
    meta: { title: 'Settings', icon: 'settings' },
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} — HomeNest` : 'HomeNest'
})