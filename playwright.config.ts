import { defineConfig, devices } from '@playwright/test'

const PORTA = 4173
const BASE = process.env.BASE_PATH ?? '/agenda-saude/'

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: `http://localhost:${PORTA}${BASE}`,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npx vite preview --port ${PORTA} --strictPort`,
    env: { BASE_PATH: BASE },
    url: `http://localhost:${PORTA}${BASE}`,
    reuseExistingServer: !process.env.CI,
  },
})