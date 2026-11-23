import { defineConfig, devices } from '@playwright/test'

/*
 * Testes e2e (tests/e2e) contra o build de produção, servido como no GitHub Pages: em /agenda-saude/.
 * - Local: `npm run e2e` (gera o build com esse base path e roda os testes).
 * - CI: o deploy.yml já gerou o build; roda só `npx playwright test`, com o mesmo BASE_PATH.
 * A data fica fixa em 18/11/2026 (page.clock, ver tests/e2e/ajuda.ts): a agenda é sempre a mesma.
 */
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
