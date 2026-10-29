import {
  constant,
  If,
  mapBindable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import type { Task } from '../domain/index.mjs';
import { m } from '../i18n/index.mjs';
import { formatWhen } from '../view-model/index.mjs';

type Props = Readonly<{
  /** With whether it is a day alone, written without a time. */
  dueDate: Bindable<Readonly<{ at: number; allDay: boolean }> | undefined>;
  overdue: Bindable<boolean>;
}>;

/** A due date, marked — in words as well as colour — once it has passed. */
export const DueDate = ({ dueDate, overdue }: Props): JSX.Element => (
  <If
    cond={mapBindable(dueDate, (date) => date !== undefined)}
    then={
      <span class={{ 'due-date': constant(true), overdue }}>
        {mapBindable(dueDate, (date) =>
          date === undefined ? '' : formatWhen(date.at, date.allDay),
        )}
        <If
          cond={overdue}
          then={
            <span class={constant('overdue-mark')}>
              {constant(m.list.overdue)}
            </span>
          }
        />
      </span>
    }
  />
);

/** What {@link DueDate} shows of `task`. */
export const dueOf = (
  task: Task,
): Readonly<{ at: number; allDay: boolean }> | undefined =>
  task.dueDate === undefined
    ? undefined
    : ({ at: task.dueDate, allDay: task.dueAllDay } as const);
