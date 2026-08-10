import { type Percent } from 'ts-type-forge';

// embed-sample-code-ignore-above

const calculateProgress = (completed: number, total: number): Percent => {
  const percentage = Math.round((completed / total) * 100);
  return Math.min(100, Math.max(0, percentage)) as Percent;
};

const formatPercent = (value: Percent): string => `${value}%`;

const fullProgress = 100 satisfies Percent;
const halfProgress = 50 satisfies Percent;
const noProgress = 0 satisfies Percent;

// Usage in progress bars, loading indicators, etc.
type ProgressBarProps = {
  progress: Percent;
  showLabel?: boolean;
};

// embed-sample-code-ignore-below
export {
  calculateProgress,
  formatPercent,
  fullProgress,
  halfProgress,
  noProgress,
};
export type { ProgressBarProps };
