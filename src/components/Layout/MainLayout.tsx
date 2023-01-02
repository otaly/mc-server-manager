import { Flex } from '@chakra-ui/react';
import { css } from '@emotion/react';
import { Header } from './Header';

type MainLayoutProps = {
  children: React.ReactNode;
};

export const MainLayout = ({ children }: MainLayoutProps) => (
  <Flex
    bg="bg.500"
    direction="column"
    position="relative"
    overflow="auto"
    css={css({ height: ['100vh', '100dvh'] })}
  >
    <Header />
    {children}
  </Flex>
);
