import {
  constant,
  If,
  mapBindable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { formatDateTime } from '../view-model/index.mjs';

type Props = Readonly<{
  dueDate: Bindable<number | undefined>;
  overdue: Bindable<boolean>;
}>;

/** A due date, marked — in words as well as colour — once it has passed. */
export const DueDate = ({ dueDate, overdue }: Props): JSX.Element => (
  <If
    cond={mapBindable(dueDate, (date) => date !== undefined)}
    then={
      <span class={{ 'due-date': constant(true), overdue }}>
        {mapBindable(dueDate, (date) =>
          date === undefined ? '' : formatDateTime(date),
        )}
        <If
          cond={overdue}
          then={
            <span class={constant('overdue-mark')}>{constant('期限切れ')}</span>
          }
        />
      </span>
    }
  />
);
