'use client';

import { Span, Text } from '@chakra-ui/react';
import type { ServerState } from '@/types/server';
import { formatElapsedTime } from '@/utils/format';

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
  let content: React.ReactNode;

  switch (serverState) {
    case 'starting':
      content = <Span>STARTING...</Span>;
      break;
    case 'running': {
      const elapsed = startedAt ? formatElapsedTime(startedAt) : '';
      content = (
        <>
          <Span>RUNNING</Span>
          {elapsed && <Span ml={1.5}>{elapsed} ago</Span>}
        </>
      );
      break;
    }
    case 'stopping':
      content = <Span>STOPPING...</Span>;
      break;
    case 'stopped': {
      const elapsed = stoppedAt ? formatElapsedTime(stoppedAt) : '';
      content = (
        <>
          <Span>STOPPED</Span>
          {elapsed && <Span ml={1.5}>{elapsed} ago</Span>}
        </>
      );
      break;
    }
    default:
      content = null;
  }

  return (
    <Text fontSize="xs" lineHeight="1.33" color="white/36">
      {content}
    </Text>
  );
};
