import { IList, IRecord, IRecordType } from '../../utils/immutable';
import { DatetimeSpecificationEnumType } from '../enum/datetime-specification-type';
import { IAnswerSymbolType } from './answer-symbol';
import { IDatetimeRangeType } from './datetime-range';
import { IYmdHm, IYmdHmType } from './ymd-hm';

type EventScheduleType = {
  title: string;
  notes: string;
  datetimeSpecification: DatetimeSpecificationEnumType;
  datetimeRangeList: IList<IDatetimeRangeType>;
  useAnswerDeadline: boolean;
  answerDeadline: IYmdHmType;
  usePassword: boolean;
  password: string;
  answerSymbolList: IList<IAnswerSymbolType>;
};

export const IEventSchedule = IRecord<EventScheduleType>({
  title: '',
  notes: '',
  datetimeSpecification: 'noStartEndSpecified',
  datetimeRangeList: IList<IDatetimeRangeType>(),
  useAnswerDeadline: false,
  answerDeadline: IYmdHm(),
  usePassword: false,
  password: '',
  answerSymbolList: IList<IAnswerSymbolType>(),
});

export type IEventScheduleType = IRecordType<EventScheduleType>;
