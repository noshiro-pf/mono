import type { InitializedObservable } from 'synstate';
import { constant, If, mapBindable, view, type JSX } from 'synstate-dom';
import { dict, ymdhm2strWithDay } from '../../constants/index.mjs';
import { eventIsAfterDeadline } from '../../functions/index.mjs';
import { Description } from '../atoms/index.mjs';
import * as styles from './answer-page-event-info.module.css';
import { AnswerPageNotes } from './answer-page-notes.js';

const dc = dict.answerPage;

type Props = Readonly<{ eventSchedule: InitializedObservable<EventSchedule> }>;

/** The event's title, notes and answer deadline. */
export const AnswerPageEventInfo = ({ eventSchedule }: Props): JSX.Element => {
  const afterDeadline$ = view(eventSchedule, eventIsAfterDeadline);

  return (
    <div class={constant(styles.grid)}>
      <div class={constant(label(styles.label1))}>
        {constant(dc.eventInfo.eventName)}
      </div>
      <div
        class={constant(value(styles.value1))}
        data-e2e={constant('event-title')}
      >
        {view(eventSchedule, (e) => e.title)}
      </div>
      <div class={constant(label(styles.label2))}>
        {constant(dc.eventInfo.notes)}
      </div>
      <div class={constant(value(styles.value2))}>
        <AnswerPageNotes notes={view(eventSchedule, (e) => e.notes)} />
      </div>
      <div class={constant(label(styles.label3))}>
        {constant(dc.eventInfo.answerDeadline)}
      </div>
      <div class={constant(value(styles.value3))}>
        <If
          cond={view(eventSchedule, (e) => e.answerDeadline === 'none')}
          then={
            <div>{constant(dict.answerPage.eventInfo.noAnswerDeadline)}</div>
          }
          else={
            <>
              <div>
                {view(eventSchedule, (e) =>
                  e.answerDeadline === 'none'
                    ? ''
                    : ymdhm2strWithDay(e.answerDeadline),
                )}
              </div>
              <Description
                error={afterDeadline$}
                text={mapBindable(afterDeadline$, (after) =>
                  after
                    ? dc.eventInfo.answerDeadlineIsExpired
                    : dc.eventInfo.answerDeadlineDescription,
                )}
              />
            </>
          }
        />
      </div>
    </div>
  );
};

const label = (area: string): string =>
  `${styles.cell} ${styles.label} ${area}` as const;

const value = (area: string): string =>
  `${styles.cell} ${styles.value} ${area}` as const;
