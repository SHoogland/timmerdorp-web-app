import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    sentryVitePlugin({
      org: "timmerdorp",
      project: "timmerdorp-web-app",
      authToken: process.env.SENTRY_AUTH_TOKEN,
      telemetry: process.env.SENTRY_TELEMETRY === "true",
    })
  ],

  build: {
    sourcemap: true
  }
})