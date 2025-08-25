import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'

dotenv.config()

// https://vite.dev/config/
export default defineConfig({
  base: '/weatherapp/',
  server: {
    host: true,
    port: process.env.PORT  
  }, 
  plugins: [react()],
})
