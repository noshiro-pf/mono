import { IList, IRecord, IRecordType } from '../../utils/immutable';
import {
  fillAnswerSelection,
  IAnswerSelection,
  PartialAnswerSelection,
} from './answer-selection';

type AnswerBaseType = {
  id: string;
  userName: string;
  comment: string;
  selection: IList<IAnswerSelection>;
  createdAt: number;
};

export type PartialAnswer = Partial<
  Readonly<{
    id: AnswerBaseType['id'];
    userName: AnswerBaseType['userName'];
    comment: AnswerBaseType['comment'];
    selection: readonly PartialAnswerSelection[];
    createdAt: AnswerBaseType['createdAt'];
  }>
>;

export type IAnswer = IRecordType<AnswerBaseType>;

const IAnswerRecordFactory = IRecord<AnswerBaseType>({
  id: '',
  userName: '',
  comment: '',
  selection: IList<IAnswerSelection>(),
  createdAt: Date.now(),
});

export const createIAnswerWithoutId: (
  a: Omit<AnswerBaseType, 'id'>
) => IAnswer = IAnswerRecordFactory;

export const createIAnswer: (
  a?: AnswerBaseType
) => IAnswer = IAnswerRecordFactory;

const d = IAnswerRecordFactory();
export const fillAnswer = (p: PartialAnswer): IAnswer =>
  createIAnswer({
    id: p.id ?? d.id,
    userName: p.userName ?? d.userName,
    comment: p.comment ?? d.comment,
    selection: IList(p.selection ?? d.selection).map(fillAnswerSelection),
    createdAt: p.createdAt ?? d.createdAt,
  });
