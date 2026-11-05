import {
  constant,
  For,
  mapBindable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { dict } from '../../constants/index.mjs';
import type { EventSettingsPageDiffResult } from '../../functions/index.mjs';
import * as styles from './event-schedule-diff.module.css';

type Props = Readonly<{ diff: Bindable<EventSettingsPageDiffResult> }>;

const list1 = [
  'title',
  'notes',
  'datetimeSpecification',
] as const satisfies readonly (keyof EventSchedule)[];

const list2 = [
  'answerDeadline',
  'author',
  'timezoneOffsetMinutes',
] as const satisfies readonly (keyof EventSchedule)[];

const dc = dict.eventSettingsPage.diff;

/** What the edit changes, drawn again whenever it changes. */
export const EventScheduleDiff = ({ diff }: Props): JSX.Element => (
  <div class={constant(styles.root)}>
    <div class={constant(styles.box)}>
      <div class={constant(styles.title)}>{constant(dc.title)}</div>
      <ul data-e2e={constant('diff-ul')}>
        <For items={mapBindable(diff, (d) => [d])} key={(d) => d}>
          {(diff$) => <DiffItems diff={diff$.getSnapshot().value} />}
        </For>
      </ul>
    </div>
  </div>
);

const text = (s: string): JSX.Element => <>{constant(s)}</>;

const li = (...children: readonly JSX.Element[]): JSX.Element => (
  <li>{children}</li>
);

const DiffItems = ({
  diff,
}: Readonly<{ diff: EventSettingsPageDiffResult }>): JSX.Element => {
  const { answerIcons } = diff;

  const fairChanged =
    answerIcons.fair.description !== undefined ||
    answerIcons.fair.point !== undefined;

  const iconsChanged =
    answerIcons.good.description !== undefined ||
    fairChanged ||
    answerIcons.poor.description !== undefined;

  return (
    <>
      {list1.map((key) => {
        const s = diff[key];

        return s === undefined ? [] : li(text(dc.items[key]), text(s));
      })}

      {/* datetimeRangeList */}
      {diff.datetimeRangeList === undefined ? (
        []
      ) : (
        <>
          {li(text(dc.items.datetimeRangeList.title))}
          <ul>
            {li(text(dc.items.datetimeRangeList.added))}
            <ul>{diff.datetimeRangeList.added.map((s) => li(text(s)))}</ul>
            {li(text(dc.items.datetimeRangeList.deleted))}
            <ul>{diff.datetimeRangeList.deleted.map((s) => li(text(s)))}</ul>
          </ul>
        </>
      )}

      {/* notificationSettings */}
      {diff.notificationSettings === undefined ? (
        []
      ) : (
        <>
          {li(text(dc.items.notificationSettings.title))}
          <ul>{diff.notificationSettings.map((s) => li(text(s)))}</ul>
        </>
      )}

      {list2.map((key) => {
        const s = diff[key];

        return s === undefined ? [] : li(text(dc.items[key]), text(s));
      })}

      {/* answerIcons */}
      {iconsChanged ? (
        <li>
          {constant(dc.items.answerIcons.title)}
          <ul>
            {answerIcons.good.description === undefined
              ? []
              : li(
                  text(dc.items.answerIcons.good.title),
                  <ul>
                    {li(
                      text(dc.items.answerIcons.good.description),
                      text(answerIcons.good.description),
                    )}
                  </ul>,
                )}

            {fairChanged
              ? li(
                  text(dc.items.answerIcons.fair.title),
                  <ul>
                    {answerIcons.fair.description === undefined
                      ? []
                      : li(
                          text(dc.items.answerIcons.fair.description),
                          text(answerIcons.fair.description),
                        )}
                    {answerIcons.fair.point === undefined
                      ? []
                      : li(
                          text(dc.items.answerIcons.fair.point),
                          text(answerIcons.fair.point),
                        )}
                  </ul>,
                )
              : []}

            {answerIcons.poor.description === undefined
              ? []
              : li(
                  text(dc.items.answerIcons.poor.title),
                  <ul>
                    {li(
                      text(dc.items.answerIcons.poor.description),
                      text(answerIcons.poor.description),
                    )}
                  </ul>,
                )}
          </ul>
        </li>
      ) : (
        []
      )}
    </>
  );
};
