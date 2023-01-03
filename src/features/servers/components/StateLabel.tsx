import { formatElapsedTime } from '@/utils/format';
import { Box, Text } from '@chakra-ui/react';
import React from 'react';
import { ServerState } from '../types';

type StateLabelProps = {
  serverState?: ServerState;
  startedAt?: Date;
  stoppedAt?: Date;
};

export const StateLabel = ({
  serverState = 'stopped',
  startedAt,
  stoppedAt,
}: StateLabelProps) => {
  let text: React.ReactNode;
  let elapsedTimeText = '';
  switch (serverState) {
    case 'starting':
      text = <Box as="span">STARTING...</Box>;
      break;
    case 'running':
      elapsedTimeText = startedAt ? formatElapsedTime(startedAt) : '';

      text = (
        <>
          <Box as="span">RUNNING</Box>
          {elapsedTimeText ? (
            <Box as="span" marginLeft={1.5}>
              {elapsedTimeText} ago
            </Box>
          ) : undefined}
        </>
      );
      break;
    case 'stopping':
      text = `STOPPING...`;
      break;
    case 'stopped':
      elapsedTimeText = stoppedAt ? formatElapsedTime(stoppedAt) : '';

      text = (
        <>
          <Box as="span">STOPPED</Box>
          {elapsedTimeText ? (
            <Box as="span" marginLeft={1.5}>
              {elapsedTimeText} ago
            </Box>
          ) : undefined}
        </>
      );
      break;
    default:
      break;
  }

  return (
    <Text fontSize="xs" lineHeight="1.33" color="whiteAlpha.500">
      {text}
    </Text>
  );
};
