import { defineConfig } from 'vite';
import { resolve } from 'path';
import handlebars from 'vite-plugin-handlebars';

export default defineConfig({
  base: '',
  plugins: [
    handlebars({
      // Указываем папку, где будут лежать переиспользуемые блоки (шапка, подвал и т.д.)
      partialDirectory: resolve(__dirname, 'partials'),
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        portfolio: resolve(__dirname, 'portfolio.html'),
        otzyvy: resolve(__dirname, 'otzyvy.html'),
        contacts: resolve(__dirname, 'contacts.html'),
        uslugi: resolve(__dirname, 'uslugi.html'),
        'svadba-pod-klyuch': resolve(__dirname, 'uslugi/svadba-pod-klyuch.html'),
        'oformlenie-zala': resolve(__dirname, 'uslugi/oformlenie-zala.html'),
        'vyezdnaya-registraciya': resolve(__dirname, 'uslugi/vyezdnaya-registraciya.html'),
        faq: resolve(__dirname, 'faq.html'),
        privacy: resolve(__dirname, 'privacy.html'),
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
