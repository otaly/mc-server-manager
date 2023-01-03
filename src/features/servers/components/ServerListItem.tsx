import { ServerIcon } from '@/components/Elements';
import { Flex, HStack, Stack, Text } from '@chakra-ui/react';
import { ServerState } from '../types';
import { ControlButton } from './ControlButton';
import { StateLabel } from './StateLabel';

type ServerListItemProps = {
  isFirst?: boolean;
  serverName?: string;
  mcVersion?: string;
  state?: ServerState;
  startedAt?: Date;
  stoppedAt?: Date;
};

export const ServerListItem = ({
  isFirst = false,
  serverName = '',
  mcVersion = '',
  state = 'stopped',
  startedAt,
  stoppedAt,
}: ServerListItemProps) => (
  <Flex
    as="li"
    align="center"
    px={8}
    py={4}
    borderTop={isFirst ? '1px' : undefined}
    borderBottom="1px"
    borderColor="border.500"
    role="group"
  >
    <Flex align="center" gap={8} flex={1}>
      <ServerIcon isActive={state === 'running'} h={8} />
      <Stack spacing={1} width="11rem">
        <Text noOfLines={1}>{serverName}</Text>
        <StateLabel
          serverState={state}
          startedAt={startedAt}
          stoppedAt={stoppedAt}
        />
      </Stack>
      {mcVersion ? (
        <Text lineHeight="shorter" color="whiteAlpha.500">
          MC{mcVersion}
        </Text>
      ) : undefined}
    </Flex>
    <HStack transitionDuration="100ms" opacity={0} _groupHover={{ opacity: 1 }}>
      <ControlButton
        type={state === 'stopped' || state === 'stopping' ? 'start' : 'stop'}
        disabled={state === 'starting' || state === 'stopping'}
        onClick={() => console.log('click. state:', state)}
      />
    </HStack>
  </Flex>
);
