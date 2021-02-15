import { StrictOmit } from '@noshiro/ts-utils';
import { IList, IRecord } from '../../utils/immutable';
import { answerId, AnswerId, userName, UserName } from '../phantom';
import {
  fillAnswerSelection,
  IAnswerSelection,
  PartialAnswerSelection,
} from './answer-selection';

export const ANSWER_KEY_CREATED_AT = 'createdAt';

type AnswerBaseType = Readonly<{
  id: AnswerId;
  userName: UserName;
  comment: string;
  selection: IList<IAnswerSelection>;
  [ANSWER_KEY_CREATED_AT]: number;
}>;

export type PartialAnswer = Partial<
  Readonly<{
    id: AnswerBaseType['id'];
    userName: AnswerBaseType['userName'];
    comment: AnswerBaseType['comment'];
    selection: readonly PartialAnswerSelection[];
    [ANSWER_KEY_CREATED_AT]: AnswerBaseType[typeof ANSWER_KEY_CREATED_AT];
  }>
>;

export type IAnswer = IRecord<AnswerBaseType> & Readonly<AnswerBaseType>;

const IAnswerRecordFactory = IRecord<AnswerBaseType>({
  id: answerId(''),
  userName: userName(''),
  comment: '',
  selection: IList<IAnswerSelection>(),
  [ANSWER_KEY_CREATED_AT]: Date.now(),
});

export const createIAnswerWithoutId: (
  a: StrictOmit<AnswerBaseType, 'id'>
) => IAnswer = IAnswerRecordFactory;

export const createIAnswer: (
  a?: AnswerBaseType
) => IAnswer = IAnswerRecordFactory;

const d = IAnswerRecordFactory();
export const fillAnswer = (p?: PartialAnswer): IAnswer =>
  createIAnswer({
    id: p?.id ?? d.id,
    userName: p?.userName ?? d.userName,
    comment: p?.comment ?? d.comment,
    selection: IList(p?.selection ?? d.selection).map(fillAnswerSelection),
    [ANSWER_KEY_CREATED_AT]:
      (p === undefined ? undefined : p[ANSWER_KEY_CREATED_AT]) ??
      d[ANSWER_KEY_CREATED_AT],
  });
