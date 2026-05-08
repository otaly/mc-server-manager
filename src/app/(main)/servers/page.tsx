import { Container } from '@chakra-ui/react';
import { ServerList } from './_components/ServerList';

export default function ServersPage() {
  return (
    <Container mt={24} p={0} maxW="container.lg">
      <ServerList />
    </Container>
  );
}
