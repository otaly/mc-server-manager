import type { Server } from '@/types/server';

export const MOCK_SERVERS: Server[] = [
  {
    id: '0',
    name: 'server-name',
    mcVersion: '1.8.0',
    state: 'stopped',
    stoppedAt: new Date('2023-01-03T01:00:00'),
  },
  {
    id: '1',
    name: 'server-name',
    mcVersion: '1.8.0',
    state: 'starting',
    stoppedAt: new Date('2023-01-02T01:00:00'),
  },
  {
    id: '2',
    name: '黄昏の森&魔法MOD',
    mcVersion: '1.12.0',
    state: 'running',
    startedAt: new Date('2023-01-03T01:00:00'),
  },
  {
    id: '3',
    name: 'server-name',
    mcVersion: '1.10.1',
    state: 'stopping',
  },
];

export const fetchServers = (): Promise<Server[]> =>
  new Promise((res) => {
    setTimeout(() => res(MOCK_SERVERS), 500);
  });
