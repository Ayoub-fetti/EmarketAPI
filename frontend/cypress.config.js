import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173', // Vite default port
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 15000, // Augmenté pour laisser plus de temps au chargement
    requestTimeout: 15000,
    responseTimeout: 15000,
    pageLoadTimeout: 30000, // Timeout pour le chargement de page
    setupNodeEvents(on, config) {
      // Vérifier que le serveur est accessible avant de lancer les tests
      on('task', {
        checkServer() {
          return new Promise((resolve) => {
            // Utiliser require pour compatibilité avec Node.js dans Cypress
            const http = require('http');
            const req = http.get('http://localhost:5173', (res) => {
              resolve({ status: res.statusCode, running: true });
            });
            req.on('error', () => {
              resolve({ status: 0, running: false });
            });
            req.setTimeout(2000, () => {
              req.destroy();
              resolve({ status: 0, running: false });
            });
          });
        },
      });
    },
  },
});

