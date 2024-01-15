import { type EventSettingsPageDiffResult } from '../../functions';

type Props = Readonly<{
  diff: EventSettingsPageDiffResult;
}>;

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

export const EventScheduleDiff = memoNamed<Props>(
  'EventScheduleDiff',
  ({ diff }) => (
    <div
      css={css`
        margin: 10px 20px;
      `}
    >
      <div
        css={css`
          padding: 15px 20px;
          border-radius: 5px;
          border-style: solid;
          border-color: gray;
        `}
      >
        <div
          css={css`
            margin: 5px;
          `}
        >
          {dc.title}
        </div>
        <ul data-cy={'diff-ul'}>
          {list1.map((li) =>
            mapOptional(diff[li], (s) => (
              <li key={li}>
                {dc.items[li]}
                {s}
              </li>
            )),
          )}

          {/* datetimeRangeList */}
          {mapOptional(diff.datetimeRangeList, (list) => (
            <>
              <li>{dc.items.datetimeRangeList.title}</li>
              <ul>
                <li>{dc.items.datetimeRangeList.added}</li>
                <ul>
                  {list.added.map((li) => (
                    <li key={li}>{li}</li>
                  ))}
                </ul>
                <li>{dc.items.datetimeRangeList.deleted}</li>
                <ul>
                  {list.deleted.map((li) => (
                    <li key={li}>{li}</li>
                  ))}
                </ul>
              </ul>
            </>
          ))}

          {/* notificationSettings */}
          {mapOptional(diff.notificationSettings, (list) => (
            <>
              <li>{dc.items.notificationSettings.title}</li>
              <ul>
                {list.map((li) => (
                  <li key={li}>{li}</li>
                ))}
              </ul>
            </>
          ))}

          {list2.map((li) =>
            mapOptional(diff[li], (s) => (
              <li key={li}>
                {dc.items[li]}
                {s}
              </li>
            )),
          )}

          {/* answerIcons */}
          {diff.answerIcons.good.description === undefined &&
          diff.answerIcons.fair.description === undefined &&
          diff.answerIcons.fair.point === undefined &&
          diff.answerIcons.poor.description === undefined ? undefined : (
            <li>
              {dc.items.answerIcons.title}
              <ul>
                {mapOptional(diff.answerIcons.good.description, (s) => (
                  <li>
                    {dc.items.answerIcons.good.title}
                    <ul>
                      <li>
                        {dc.items.answerIcons.good.description}
                        {s}
                      </li>
                    </ul>
                  </li>
                ))}

                {diff.answerIcons.fair.description === undefined &&
                diff.answerIcons.fair.point === undefined ? undefined : (
                  <li>
                    {dc.items.answerIcons.fair.title}
                    <ul>
                      {mapOptional(diff.answerIcons.fair.description, (s) => (
                        <li>
                          {dc.items.answerIcons.fair.description}
                          {s}
                        </li>
                      ))}
                      {mapOptional(diff.answerIcons.fair.point, (s) => (
                        <li>
                          {dc.items.answerIcons.fair.point}
                          {s}
                        </li>
                      ))}
                    </ul>
                  </li>
                )}

                {mapOptional(diff.answerIcons.poor.description, (s) => (
                  <li>
                    {dc.items.answerIcons.poor.title}
                    <ul>
                      <li>
                        {dc.items.answerIcons.poor.description}
                        {s}
                      </li>
                    </ul>
                  </li>
                ))}
              </ul>
            </li>
          )}
        </ul>
      </div>
    </div>
  ),
);
