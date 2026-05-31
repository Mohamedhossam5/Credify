import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Trigger notification bell shortcut & premium tooltip
import('../scratch/add_notification_shortcut.js').catch(console.error);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
