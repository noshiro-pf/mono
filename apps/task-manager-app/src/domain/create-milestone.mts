import { type StrictOmit } from 'ts-type-forge';
import { type Milestone, type MilestoneId } from './types.mjs';

/**
 * A new milestone: `id`, `title` and the creation time are required, and
 * every other field defaults to an empty value — no date, no manual check,
 * no dependencies, which makes a milestone that is reached at once.
 */
export const createMilestone = ({
  id,
  title,
  now,
  ...fields
}: CreateMilestoneParams): Milestone =>
  ({
    ...defaults,
    ...fields,
    id,
    title,
    createdAt: now,
    updatedAt: now,
  }) as const;

export type CreateMilestoneParams = Readonly<{
  id: MilestoneId;
  title: string;
  /** Becomes both `createdAt` and `updatedAt`. */
  now: number;
}> &
  Partial<StrictOmit<Milestone, 'id' | 'title' | 'createdAt' | 'updatedAt'>>;

const defaults = {
  description: '',
  date: undefined,
  requiresManualCheck: false,
  checkedAt: undefined,
  dependencies: [],
} as const satisfies StrictOmit<
  Milestone,
  'id' | 'title' | 'createdAt' | 'updatedAt'
>;
