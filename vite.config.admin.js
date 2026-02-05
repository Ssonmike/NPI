import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Vite config for Admin Panel - serves admin.html on port 3001
export default defineConfig({
    plugins: [
        react(),
        {
            name: 'admin-html-middleware',
            configureServer(server) {
                server.middlewares.use((req, res, next) => {
                    // Redirect root to admin.html
                    if (req.url === '/') {
                        req.url = '/admin.html'
                    }
                    next()
                })
            }
        }
    ],
    root: '.',
    publicDir: 'public',
    build: {
        outDir: 'dist-admin',
        emptyOutDir: true,
        rollupOptions: {
            input: path.resolve(__dirname, 'admin.html')
        }
    },
    server: {
        port: 3001,
        allowedHosts: true,
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true
            }
        }
    }
})
