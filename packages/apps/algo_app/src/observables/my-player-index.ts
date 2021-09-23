import { createState } from '@noshiro/syncflow';
import type { PlayerIndex } from '../types';

export const [myPlayerIndex$, setMyPlayerIndex] = createState<PlayerIndex>(0);
