import { ReadonlyDate } from '../../types';

export const toTimestamp = (d: ReadonlyDate): number => d.getTime();
