import { ExtractFnReturnType, QueryConfig } from '@/lib/react-query';
import { useQuery } from 'react-query';
import { Server } from '../types';

const servers: Server[] = [
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

const getServers = (): Promise<Server[]> =>
  new Promise((res) => {
    setTimeout(() => res(servers), 500);
  });

type QueryFnType = typeof getServers;

type UseServersOptions = {
  config?: QueryConfig<QueryFnType>;
};

export const useServers = ({ config }: UseServersOptions = {}) =>
  useQuery<ExtractFnReturnType<QueryFnType>>({
    ...config,
    queryKey: ['servers'],
    queryFn: () => getServers(),
  });
