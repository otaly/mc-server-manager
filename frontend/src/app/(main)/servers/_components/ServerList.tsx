'use client';

import { List, Spinner, Text } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { getServerPollingInterval } from '@/utils/pollingInterval';
import { fetchServers } from './mockServers';
import { ServerListItem } from './ServerListItem';

export const ServerList = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['servers'],
    queryFn: fetchServers,
    refetchInterval: (query) => getServerPollingInterval(query.state.data),
  });

  if (isLoading) {
    return <Spinner size="lg" />;
  }

  if (!data || data.length === 0) {
    return <Text fontWeight="bold">No Servers Found</Text>;
  }

  return (
    <List.Root variant="plain">
      {data.map((server, idx) => (
        <ServerListItem key={server.id} isFirst={idx === 0} server={server} />
      ))}
    </List.Root>
  );
};
