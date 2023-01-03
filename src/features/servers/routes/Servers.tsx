import { Container } from '@chakra-ui/react';
import { ServerList } from '../components/ServerList';

export const Servers = () => (
  <Container marginTop={24} p={0} maxW="container.lg">
    <ServerList />
  </Container>
);
