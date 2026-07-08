<script setup lang="ts">
/**
 * Settings Surface — system status, Jellyfin & HA connection panels,
 * network/display/audio info, and server configuration.
 */
import { onMounted, ref } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import UIcon from '@/skills/atoms/UIcon.vue'

const store = useSettingsStore()

// ── connection form state ─────────────────────────────────────

const jfUrl = ref('')
const jfKey = ref('')
const haUrl = ref('')
const haToken = ref('')
const showJfForm = ref(false)
const showHaForm = ref(false)

onMounted(async () => {
  await store.fetchSettings()
  jfUrl.value = store.jellyfin.url
  haUrl.value = store.homeAssistant.url
})

async function connectJellyfin() {
  store.clearMessages()
  await store.saveConnection('jellyfin', jfUrl.value, jfKey.value)
  if (!store.error) {
    jfKey.value = ''
    showJfForm.value = false
  }
}

async function connectHA() {
  store.clearMessages()
  await store.saveConnection('home_assistant', haUrl.value, haToken.value)
  if (!store.error) {
    haToken.value = ''
    showHaForm.value = false
  }
}
</script>

<template>
  <div class="surface">
    <div class="surface__header">
      <h1 class="surface__title">Settings</h1>
      <p class="surface__description">System configuration & connections</p>
    </div>

    <div class="surface__content">
      <!-- Messages -->
      <div
        v-if="store.error"
        class="usx-banner usx-banner--error"
        style="margin-bottom: var(--usx-spacing-lg)"
      >
        <UIcon name="error" />
        <span>{{ store.error }}</span>
        <button class="usx-btn usx-btn--ghost" @click="store.clearMessages()">&times;</button>
      </div>
      <div
        v-if="store.success"
        class="usx-banner usx-banner--success"
        style="margin-bottom: var(--usx-spacing-lg)"
      >
        <UIcon name="check_circle" />
        <span>{{ store.success }}</span>
      </div>

      <!-- Loading -->
      <div v-if="store.loading" class="usx-flex-center" style="padding: var(--usx-spacing-2xl)">
        <div style="width: 40px; height: 40px; border: 4px solid var(--usx-color-border); border-top-color: var(--usx-color-primary); border-radius: 50%; animation: spin 0.8s linear infinite"></div>
      </div>

      <template v-else>
        <!-- ── Connections section ────────────────────────── -->
        <section style="margin-bottom: var(--usx-spacing-xl)">
          <h2 class="surface__panel-title">Connections</h2>

          <div class="usx-grid">
            <!-- Jellyfin card -->
            <div class="usx-card usx-card--outlined">
              <div class="usx-flex-row" style="justify-content: space-between; align-items: flex-start">
                <div class="usx-flex-row" style="gap: var(--usx-spacing-md)">
                  <div class="hn-settings-icon" :class="store.jellyfin.api_key_set ? 'hn-settings-icon--connected' : ''">
                    <UIcon name="dns" />
                  </div>
                  <div>
                    <div style="font-weight: var(--usx-font-weight-semibold); font-size: var(--usx-font-size-lg)">
                      Media Server (Jellyfin)
                    </div>
                    <div style="font-size: var(--usx-font-size-sm); color: var(--usx-color-on-surface-muted)">
                      {{ store.jellyfin.api_key_set
                        ? `Connected · ${store.jellyfin.api_key_preview}`
                        : 'Not connected' }}
                    </div>
                  </div>
                </div>
                <span
                  class="usx-badge"
                  :class="store.jellyfin.api_key_set ? 'usx-badge--success' : 'usx-badge--warning'"
                >
                  {{ store.jellyfin.api_key_set ? 'Online' : 'Offline' }}
                </span>
              </div>

              <!-- Expandable form -->
              <div v-if="showJfForm" style="margin-top: var(--usx-spacing-md); padding-top: var(--usx-spacing-md); border-top: 1px solid var(--usx-color-border)">
                <label class="hn-field">
                  <span class="hn-field__label">Jellyfin URL</span>
                  <input
                    v-model="jfUrl"
                    type="text"
                    class="hn-input"
                    placeholder="http://localhost:8096"
                  />
                </label>
                <label class="hn-field" style="margin-top: var(--usx-spacing-sm)">
                  <span class="hn-field__label">API Key</span>
                  <input
                    v-model="jfKey"
                    type="password"
                    class="hn-input"
                    placeholder="Paste your Jellyfin API key"
                  />
                </label>
                <div class="hn-field-hint">
                  Get your key at <strong>Dashboard → API Keys</strong> in Jellyfin.
                   <a href="http://localhost:8096/web/#/apikeys.html" target="_blank" style="color: var(--usx-color-primary)">Open Jellyfin Dashboard &nearr;</a>
                </div>
                <div class="usx-flex-row usx-gap-sm" style="margin-top: var(--usx-spacing-sm)">
                  <button class="usx-btn usx-btn--primary" :disabled="store.saving" @click="connectJellyfin">
                    {{ store.saving ? 'Connecting...' : 'Connect' }}
                  </button>
                  <button class="usx-btn usx-btn--ghost" @click="showJfForm = false">Cancel</button>
                </div>
              </div>

              <button
                v-if="!showJfForm"
                class="usx-btn usx-btn--outline"
                style="margin-top: var(--usx-spacing-md); width: 100%"
                @click="showJfForm = true"
              >
                {{ store.jellyfin.api_key_set ? 'Reconfigure' : 'Connect Jellyfin' }}
              </button>
            </div>

            <!-- Home Assistant card -->
            <div class="usx-card usx-card--outlined">
              <div class="usx-flex-row" style="justify-content: space-between; align-items: flex-start">
                <div class="usx-flex-row" style="gap: var(--usx-spacing-md)">
                  <div class="hn-settings-icon" :class="store.homeAssistant.token_set ? 'hn-settings-icon--connected' : ''">
                    <UIcon name="hub" />
                  </div>
                  <div>
                    <div style="font-weight: var(--usx-font-weight-semibold); font-size: var(--usx-font-size-lg)">
                      Home Assistant
                    </div>
                    <div style="font-size: var(--usx-font-size-sm); color: var(--usx-color-on-surface-muted)">
                      {{ store.homeAssistant.token_set
                        ? `Connected · ${store.homeAssistant.token_preview}`
                        : 'Not connected' }}
                    </div>
                  </div>
                </div>
                <span
                  class="usx-badge"
                  :class="store.homeAssistant.token_set ? 'usx-badge--success' : 'usx-badge--warning'"
                >
                  {{ store.homeAssistant.token_set ? 'Online' : 'Offline' }}
                </span>
              </div>

              <!-- Expandable form -->
              <div v-if="showHaForm" style="margin-top: var(--usx-spacing-md); padding-top: var(--usx-spacing-md); border-top: 1px solid var(--usx-color-border)">
                <label class="hn-field">
                  <span class="hn-field__label">Home Assistant URL</span>
                  <input
                    v-model="haUrl"
                    type="text"
                    class="hn-input"
                    placeholder="http://localhost:8123"
                  />
                </label>
                <label class="hn-field" style="margin-top: var(--usx-spacing-sm)">
                  <span class="hn-field__label">Long-Lived Access Token</span>
                  <input
                    v-model="haToken"
                    type="password"
                    class="hn-input"
                    placeholder="Paste your HA token"
                  />
                </label>
                <div class="hn-field-hint">
                  Create a token at <strong>Profile → Security → Long-Lived Access Tokens</strong> in HA.
                   <a href="http://localhost:8123/profile" target="_blank" style="color: var(--usx-color-primary)">Open HA Profile &nearr;</a>
                </div>
                <div class="usx-flex-row usx-gap-sm" style="margin-top: var(--usx-spacing-sm)">
                  <button class="usx-btn usx-btn--primary" :disabled="store.saving" @click="connectHA">
                    {{ store.saving ? 'Connecting...' : 'Connect' }}
                  </button>
                  <button class="usx-btn usx-btn--ghost" @click="showHaForm = false">Cancel</button>
                </div>
              </div>

              <button
                v-if="!showHaForm"
                class="usx-btn usx-btn--outline"
                style="margin-top: var(--usx-spacing-md); width: 100%"
                @click="showHaForm = true"
              >
                {{ store.homeAssistant.token_set ? 'Reconfigure' : 'Connect Home Assistant' }}
              </button>
            </div>
          </div>
        </section>

        <!-- ── System info section ─────────────────────────── -->
        <section>
          <h2 class="surface__panel-title">System</h2>
          <div class="usx-grid">
            <div class="usx-card">
              <div class="usx-flex-row" style="gap: var(--usx-spacing-md)">
                <div class="hn-settings-icon">
                  <UIcon name="wifi" />
                </div>
                <div>
                  <div style="font-weight: var(--usx-font-weight-semibold); font-size: var(--usx-font-size-lg)">Network</div>
                  <div style="font-size: var(--usx-font-size-sm); color: var(--usx-color-on-surface-muted)">LAN: 192.168.1.42 · Connected</div>
                </div>
              </div>
            </div>

            <div class="usx-card">
              <div class="usx-flex-row" style="gap: var(--usx-spacing-md)">
                <div class="hn-settings-icon">
                  <UIcon name="desktop_windows" />
                </div>
                <div>
                  <div style="font-weight: var(--usx-font-weight-semibold); font-size: var(--usx-font-size-lg)">Display</div>
                  <div style="font-size: var(--usx-font-size-sm); color: var(--usx-color-on-surface-muted)">1080p @ 60Hz · HDMI-1</div>
                </div>
              </div>
            </div>

            <div class="usx-card">
              <div class="usx-flex-row" style="gap: var(--usx-spacing-md)">
                <div class="hn-settings-icon">
                  <UIcon name="volume_up" />
                </div>
                <div>
                  <div style="font-weight: var(--usx-font-weight-semibold); font-size: var(--usx-font-size-lg)">Audio</div>
                  <div style="font-size: var(--usx-font-size-sm); color: var(--usx-color-on-surface-muted)">HDMI Output · Stereo</div>
                </div>
              </div>
            </div>

            <div class="usx-card">
              <div class="usx-flex-row" style="gap: var(--usx-spacing-md)">
                <div class="hn-settings-icon">
                  <UIcon name="info" />
                </div>
                <div>
                  <div style="font-weight: var(--usx-font-weight-semibold); font-size: var(--usx-font-size-lg)">Version</div>
                  <div style="font-size: var(--usx-font-size-sm); color: var(--usx-color-on-surface-muted)">
                    HomeNest v0.1.0 · Linux
                  </div>
                  <div style="font-size: var(--usx-font-size-sm); color: var(--usx-color-on-surface-muted)">
                    Config: {{ store.envFileExists ? 'environment.env' : 'none (env vars)' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<style scoped>
@keyframes spin {
  to { transform: rotate(360deg); }
}

.hn-settings-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--usx-radius-md);
  background: var(--usx-color-surface-variant);
  flex-shrink: 0;
}

.hn-settings-icon--connected {
  background: color-mix(in srgb, var(--usx-color-success) 15%, transparent);
}

.hn-field {
  display: block;
}

.hn-field__label {
  display: block;
  font-size: var(--usx-font-size-sm);
  font-weight: var(--usx-font-weight-medium);
  color: var(--usx-color-on-surface-muted);
  margin-bottom: var(--usx-spacing-xs);
}

.hn-input {
  width: 100%;
  padding: var(--usx-spacing-sm) var(--usx-spacing-md);
  background: var(--usx-color-surface);
  border: 1px solid var(--usx-color-border);
  border-radius: var(--usx-radius-sm);
  color: var(--usx-color-on-surface);
  font-size: var(--usx-font-size-base);
  font-family: inherit;
  box-sizing: border-box;
}

.hn-input:focus {
  outline: none;
  border-color: var(--usx-color-primary);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--usx-color-primary) 25%, transparent);
}

.hn-field-hint {
  font-size: var(--usx-font-size-xs);
  color: var(--usx-color-on-surface-muted);
  margin-top: var(--usx-spacing-xs);
  line-height: 1.4;
}
</style>