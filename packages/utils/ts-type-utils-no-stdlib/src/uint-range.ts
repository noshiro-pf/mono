import { type Index } from './index-type';
import { type RelaxedExclude } from './utils';

export type UintRange<
  Start extends number,
  End extends number
> = RelaxedExclude<Index<End>, Index<Start>>;
