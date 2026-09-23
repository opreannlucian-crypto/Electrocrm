import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    server: {
        host: '0.0.0.0',
        port: 5173,
        hmr: {
            host: '8000-is6ut3gjrri7h79r1f879-4bb2c001.us1.manus.computer',
        },
        allowedHosts: ['.manus.computer'],
    },

    plugins: [
        laravel({
            input: ['resources/js/app.jsx'],
            refresh: true,
        }),

        react(),
    ],
});