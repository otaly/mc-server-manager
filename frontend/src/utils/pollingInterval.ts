import type { Server } from '@/types/server';

export const getServerPollingInterval = (
  servers: Server[] | undefined,
): number | false => {
  if (!servers) return false;
  const hasTransientState = servers.some(
    (s) => s.state === 'starting' || s.state === 'stopping',
  );
  return hasTransientState ? 5000 : false;
};
