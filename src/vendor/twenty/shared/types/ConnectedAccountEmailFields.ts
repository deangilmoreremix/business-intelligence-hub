import {
  type ConnectedAccountProvider,
  type EmailConnectionParameters,
} from './';

export type ConnectedAccountEmailFields = {
  provider: ConnectedAccountProvider;
  connectionParameters?: EmailConnectionParameters | null;
};
