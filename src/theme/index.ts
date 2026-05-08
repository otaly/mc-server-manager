import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const font =
  'Helvetica, "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Noto Sans JP", Arial, Meiryo, sans-serif';

const config = defineConfig({
  globalCss: {
    'html, body': {
      color: 'white',
    },
  },
  theme: {
    tokens: {
      fonts: {
        heading: { value: font },
        body: { value: font },
      },
      lineHeights: {
        base: { value: '1.4' },
        taller: { value: '1.8' },
      },
      colors: {
        bg: {
          400: { value: '#383838' },
          500: { value: '#2c2c2c' },
          700: { value: '#1e1e1e' },
        },
        border: {
          500: { value: '#444444' },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
