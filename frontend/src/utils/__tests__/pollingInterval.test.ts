import { describe, expect, it } from 'vitest';
import { getServerPollingInterval } from '../pollingInterval';
import type { Server } from '@/types/server';

const baseServer: Server = {
  id: '1',
  name: 'test',
  mcVersion: '1.12.0',
  state: 'stopped',
};

describe('getServerPollingInterval', () => {
  it('データが undefined のとき false を返す', () => {
    expect(getServerPollingInterval(undefined)).toBe(false);
  });

  it('全サーバーが stopped のとき false を返す', () => {
    const servers: Server[] = [
      { ...baseServer, state: 'stopped' },
      { ...baseServer, id: '2', state: 'stopped' },
    ];
    expect(getServerPollingInterval(servers)).toBe(false);
  });

  it('全サーバーが running のとき false を返す', () => {
    const servers: Server[] = [{ ...baseServer, state: 'running' }];
    expect(getServerPollingInterval(servers)).toBe(false);
  });

  it('starting のサーバーがいるとき 5000 を返す', () => {
    const servers: Server[] = [
      { ...baseServer, state: 'running' },
      { ...baseServer, id: '2', state: 'starting' },
    ];
    expect(getServerPollingInterval(servers)).toBe(5000);
  });

  it('stopping のサーバーがいるとき 5000 を返す', () => {
    const servers: Server[] = [
      { ...baseServer, state: 'stopped' },
      { ...baseServer, id: '2', state: 'stopping' },
    ];
    expect(getServerPollingInterval(servers)).toBe(5000);
  });
});
