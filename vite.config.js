// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     proxy: {
//       '/api': {
//         target: 'https://vps.devai.in', // The real backend
//         changeOrigin: true,
//         secure: false,
//       },
//     },
//   },
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Add these headers to allow Payment and Sensors on localhost
    headers: {
      "Permissions-Policy": "payment=(self), accelerometer=(self), gyroscope=(self), magnetometer=(self), device-orientation=(self)"
    },
    proxy: {
      '/api': {
        target: 'https://vps.devai.in',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
