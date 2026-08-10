import { type Brand } from 'ts-type-forge';

export type ObservableId = Brand<symbol, 'observable-id'>;

export type SubscriberId = Brand<symbol, 'subscriber-id'>;

export type UpdateToken = Brand<symbol, 'update-token'>;
