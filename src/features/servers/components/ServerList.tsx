import { List, Spinner, Text } from '@chakra-ui/react';
import { useServers } from '../api/getServers';
import { ServerListItem } from './ServerListItem';

export const ServerList = () => {
  const serversQuery = useServers();

  if (serversQuery.isLoading) {
    return <Spinner size="lg" />;
  }

  if (!serversQuery.data) return null;

  if (serversQuery.data.length === 0) {
    return <Text fontWeight="bold">No Servers Found</Text>;
  }

  return (
    <List spacing={0}>
      {serversQuery.data.map((server, idx) => (
        <ServerListItem
          key={server.id}
          isFirst={idx === 0}
          serverName={server.name}
          mcVersion={server.mcVersion}
          state={server.state}
          startedAt={server.startedAt}
          stoppedAt={server.stoppedAt}
        />
      ))}
    </List>
  );
};
