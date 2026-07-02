import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

const EchoPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{violet.50}',
      100: '{violet.100}',
      200: '{violet.200}',
      300: '{violet.300}',
      400: '{violet.400}',
      500: '{violet.500}',
      600: '{violet.600}',
      700: '{violet.700}',
      800: '{violet.800}',
      900: '{violet.900}',
      950: '{violet.950}',
    },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '#fafafb',
          100: '#f4f4f6',
          200: '#e5e5ea',
          300: '#d1d1d8',
          400: '#9a9aa4',
          500: '#6b6b76',
          600: '#4a4a54',
          700: '#33333b',
          800: '#212127',
          900: '#151519',
          950: '#0a0a0d',
        },
      },
      dark: {
        surface: {
          0: '#ffffff',
          50: '#e8e8ee',
          100: '#c7c7d1',
          200: '#a3a3b0',
          300: '#7a7a89',
          400: '#5b5b6a',
          500: '#3f3f4c',
          600: '#2b2b36',
          700: '#1e1e28',
          800: '#15151d',
          900: '#0d0d14',
          950: '#08080c',
        },
      },
    },
  },
});

export default EchoPreset;
