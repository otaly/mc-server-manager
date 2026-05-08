export type ServerState = 'starting' | 'running' | 'stopping' | 'stopped';

export type Server = {
  id: string;
  name: string;
  mcVersion: string;
  state: ServerState;
  startedAt?: Date;
  stoppedAt?: Date;
};
