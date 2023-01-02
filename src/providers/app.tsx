import { queryClient } from '@/lib/react-query';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import React from 'react';
import { QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';

type AppProviderProps = {
  children: React.ReactNode;
};

const font =
  'Helvetica, "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Noto Sans JP", Arial, Meiryo, sans-serif';
const theme = extendTheme({
  styles: {
    global: {
      'html, body': {
        color: 'white',
      },
    },
  },
  fonts: {
    heading: font,
    body: font,
  },
  lineHeights: {
    base: 1.4,
    taller: 1.8,
  },
  textStyles: {
    h1: {
      fontSize: '2rem',
      fontWeight: 'bold',
      lineHeight: 'short',
    },
  },
  colors: {
    bg: {
      400: '#383838',
      500: '#2c2c2c',
      700: '#1e1e1e',
    },
    border: {
      500: '#444444',
    },
  },
});

export const AppProvider = ({ children }: AppProviderProps) => (
  <ChakraProvider theme={theme}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  </ChakraProvider>
);
