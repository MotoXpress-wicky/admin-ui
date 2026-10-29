import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: 3001, // admin-ui is 3001. users-ui is 3000.
  },
})
