import { createState } from '@noshiro/syncflow';

export const [myName$, setMyName] = createState<string | undefined>(undefined);
