import type { Config } from 'tailwindcss';
import PrimeUI from 'tailwindcss-primeui';

export default {
  content: [
    './src/**/*.{html,ts}',
  ],
  plugins: [PrimeUI],
} satisfies Config;

