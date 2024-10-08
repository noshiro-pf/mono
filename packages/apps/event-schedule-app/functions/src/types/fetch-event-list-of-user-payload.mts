import * as t from '@noshiro/io-ts';

const fetchEventListOfUserPayloadTypeDef = t.record({
  filterText: t.string(''),
  filterOptionState: t.enumType(['inProgress', 'archive']),
  showAllPastDaysEvent: t.boolean(false),
  showOnlyEventSchedulesICreated: t.boolean(false),
});

export type FetchEventListOfUserPayload = t.TypeOf<
  typeof fetchEventListOfUserPayloadTypeDef
>;

export const isFetchEventListOfUserPayload =
  fetchEventListOfUserPayloadTypeDef.is;
