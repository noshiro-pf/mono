import type { NumIconFilterState } from './num-icon-filter-state';

export type AnswerTableFilteringState = DeepReadonly<{
  good: NumIconFilterState;
  fair: NumIconFilterState;
  poor: NumIconFilterState;
  upperLimit: number;
}>;
