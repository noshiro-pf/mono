import { memoNamed } from 'preact-utils';
import { formatDateTime } from '../view-model/index.mjs';

type Props = Readonly<{
  dueDate: number | undefined;
  overdue: boolean;
}>;

/** A due date, marked — in words as well as colour — once it has passed. */
export const DueDate = memoNamed<Props>('DueDate', (props) => {
  const { dueDate, overdue } = props;

  return dueDate === undefined ? undefined : (
    <span className={overdue ? 'due-date overdue' : 'due-date'}>
      {formatDateTime(dueDate)}
      {overdue ? (
        <span className={'overdue-mark'}>{'期限切れ'}</span>
      ) : undefined}
    </span>
  );
});
