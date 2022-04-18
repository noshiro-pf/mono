import type { EventSettingsPageDiffResult } from '../../functions';

type Props = Readonly<{
  diff: EventSettingsPageDiffResult;
}>;

const list1 = ['title', 'notes', 'datetimeSpecification'] as const;

const list2 = ['answerDeadline', 'author', 'timezoneOffsetMinutes'] as const;

assertType<TypeExtends<typeof list1, readonly (keyof EventSchedule)[]>>();
assertType<TypeExtends<typeof list2, readonly (keyof EventSchedule)[]>>();

const dc = dict.eventSettingsPage.diff;

export const EventScheduleDiff = memoNamed<Props>(
  'EventScheduleDiff',
  ({ diff }) => (
    <Wrapper>
      <BorderedWrapper>
        <Title>{dc.title}</Title>
        <ul>
          {list1.map((li) =>
            mapNullable(diff[li], (s) => (
              <li key={li}>
                {dc.items[li]}
                {s}
              </li>
            ))
          )}

          {/* datetimeRangeList */}
          {diff.datetimeRangeList === undefined ? undefined : (
            <>
              <li>{dc.items.datetimeRangeList.title}</li>
              <ul>
                <li>{dc.items.datetimeRangeList.added}</li>
                <ul>
                  {diff.datetimeRangeList.added.map((li) => (
                    <li key={li}>{li}</li>
                  ))}
                </ul>
                <li>{dc.items.datetimeRangeList.deleted}</li>
                <ul>
                  {diff.datetimeRangeList.deleted.map((li) => (
                    <li key={li}>{li}</li>
                  ))}
                </ul>
              </ul>
            </>
          )}

          {/* notificationSettings */}
          {diff.notificationSettings === undefined ? undefined : (
            <>
              <li>{dc.items.notificationSettings.title}</li>
              <ul>
                {diff.notificationSettings.map((li) => (
                  <li key={li}>{li}</li>
                ))}
              </ul>
            </>
          )}

          {list2.map((li) =>
            mapNullable(diff[li], (s) => (
              <li key={li}>
                {dc.items[li]}
                {s}
              </li>
            ))
          )}

          {/* answerIcons */}
          {diff.answerIcons.good.description === undefined &&
          diff.answerIcons.fair.description === undefined &&
          diff.answerIcons.fair.point === undefined &&
          diff.answerIcons.poor.description === undefined ? undefined : (
            <li>
              {dc.items.answerIcons.title}
              <ul>
                {mapNullable(diff.answerIcons.good.description, (s) => (
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
                      {mapNullable(diff.answerIcons.fair.description, (s) => (
                        <li>
                          {dc.items.answerIcons.fair.description}
                          {s}
                        </li>
                      ))}
                      {mapNullable(diff.answerIcons.fair.point, (s) => (
                        <li>
                          {dc.items.answerIcons.fair.point}
                          {s}
                        </li>
                      ))}
                    </ul>
                  </li>
                )}

                {mapNullable(diff.answerIcons.poor.description, (s) => (
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
      </BorderedWrapper>
    </Wrapper>
  )
);

const Wrapper = styled.div`
  margin: 10px 20px;
`;

const BorderedWrapper = styled.div`
  padding: 15px 20px;
  border-radius: 5px;
  border-style: solid;
  border-color: gray;
`;

const Title = styled.div`
  margin: 5px;
`;
