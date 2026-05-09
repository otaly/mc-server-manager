import { Flex } from '@chakra-ui/react';
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
    h="dvh"
  >
    <Header />
    {children}
  </Flex>
);
