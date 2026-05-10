'use client';

import { Flex, HStack, List, Stack, Text } from '@chakra-ui/react';
import type { Server } from '@/types/server';
import { ControlButton } from './ControlButton';
import { ServerIcon } from './ServerIcon';
import { StateLabel } from './StateLabel';

type ServerListItemProps = {
  isFirst?: boolean;
  server: Server;
};

export const ServerListItem = ({
  isFirst = false,
  server,
}: ServerListItemProps) => (
  <List.Item
    display="flex"
    alignItems="center"
    px={8}
    py={4}
    borderTop={isFirst ? '1px solid' : undefined}
    borderBottom="1px solid"
    borderColor="border.500"
    className="group"
  >
    <Flex align="center" gap={8} flex={1}>
      <ServerIcon isActive={server.state === 'running'} h={8} />
      <Stack gap={1} w="11rem">
        <Text lineHeight="short" truncate>
          {server.name}
        </Text>
        <StateLabel
          serverState={server.state}
          startedAt={server.startedAt}
          stoppedAt={server.stoppedAt}
        />
      </Stack>
      {server.mcVersion && (
        <Text lineHeight="shorter" color="white/36">
          MC{server.mcVersion}
        </Text>
      )}
    </Flex>
    <HStack transitionDuration="100ms" opacity={0} _groupHover={{ opacity: 1 }}>
      <ControlButton
        type={
          server.state === 'stopped' || server.state === 'stopping'
            ? 'start'
            : 'stop'
        }
        disabled={server.state === 'starting' || server.state === 'stopping'}
        onClick={() => console.log('click. state:', server.state)}
      />
    </HStack>
  </List.Item>
);
