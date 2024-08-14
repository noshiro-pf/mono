import * as syncflow from '@noshiro/syncflow';

const { createReducer, createBooleanState, createState, ...rest } = syncflow;

// eslint-disable-next-line import/no-anonymous-default-export, import/no-default-export
export default {
  ...rest,
};
