/* eslint-disable @typescript-eslint/no-restricted-imports */
/* eslint-disable import/no-internal-modules */

import type {
  HTMLInputProps as _HTMLInputProps,
  HTMLSelectProps as _HTMLSelectProps,
  IconName as _IconName,
  InputGroupProps2 as _InputGroupProps2,
  Intent as _Intent,
  IToaster as _IToaster,
  OptionProps as _OptionProps,
  PopperModifiers as _PopperModifiers,
} from '@blueprintjs/core';
import type { DateInput2Props } from '@blueprintjs/datetime2';
import type {
  Answer as _Answer,
  AnswerIconId as _AnswerIconId,
  AnswerIconIdWithNone as _AnswerIconIdWithNone,
  AnswerIconPoint as _AnswerIconPoint,
  AnswerIconSetting as _AnswerIconSetting,
  AnswerIconSettings as _AnswerIconSettings,
  AnswerId as _AnswerId,
  AnswerSelection as _AnswerSelection,
  DatetimeRange as _DatetimeRange,
  DatetimeSpecificationEnumType as _DatetimeSpecificationEnumType,
  DayType as _DayType,
  EventSchedule as _EventSchedule,
  HoursMinutes as _HoursMinutes,
  NotificationSettings as _NotificationSettings,
  TimeRange as _TimeRange,
  User as _User,
  UserId as _UserId,
  UserName as _UserName,
  Weight as _Weight,
  YearMonthDate as _YearMonthDate,
  Ymdhm as _Ymdhm,
} from '@noshiro/event-schedule-app-shared';
import type { Phantomic as _Phantomic } from '@noshiro/ts-utils-additional';
import type { dict as _dict } from '../constants/dictionary/dictionary';
import type {
  AnswerSelectionMapKey as _AnswerSelectionMapKey,
  DatetimeRangeMapKey as _DatetimeRangeMapKey,
  YmdKey as _YmdKey,
} from '../functions';
import type {
  AuthCredential as _AuthCredential,
  FireAuthUser as _FireAuthUser,
  OAuthCredential as _OAuthCredential,
  UserCredential as _UserCredential,
} from '../types/firebase-types-wrapper';

declare global {
  /* @blueprintjs/core */
  type HTMLInputProps = _HTMLInputProps;
  type HTMLSelectProps = _HTMLSelectProps;
  type IconName = _IconName;
  type InputGroupProps2 = _InputGroupProps2;
  type Intent = _Intent;
  // eslint-disable-next-line deprecation/deprecation
  type IToaster = _IToaster;
  type OptionProps = _OptionProps;
  type PopperModifiers = _PopperModifiers;

  /* @blueprintjs/datetime */
  type DatePickerShortcut = Readonly<
    ArrayElement<
      StrictExclude<DateInput2Props['shortcuts'], boolean | undefined>
    >
  >;

  /* @noshiro/event-schedule-app-shared */
  type Answer = _Answer;
  type AnswerIconId = _AnswerIconId;
  type AnswerIconIdWithNone = _AnswerIconIdWithNone;
  type AnswerIconPoint = _AnswerIconPoint;
  type AnswerIconSetting = _AnswerIconSetting;
  type AnswerIconSettings = _AnswerIconSettings;
  type AnswerId = _AnswerId;
  type AnswerSelection = _AnswerSelection;
  type DatetimeRange = _DatetimeRange;
  type DatetimeSpecificationEnumType = _DatetimeSpecificationEnumType;
  type DayType = _DayType;
  type EventSchedule = _EventSchedule;
  type HoursMinutes = _HoursMinutes;
  type NotificationSettings = _NotificationSettings;
  type TimeRange = _TimeRange;
  type User = _User;
  type UserId = _UserId;
  type UserName = _UserName;
  type Weight = _Weight;
  type YearMonthDate = _YearMonthDate;
  type Ymdhm = _Ymdhm;

  /* others */
  const dict: typeof _dict;
  type FireAuthUser = _FireAuthUser;
  type AuthCredential = _AuthCredential;
  type OAuthCredential = _OAuthCredential;
  type UserCredential = _UserCredential;
  type Phantomic<T, U extends string> = _Phantomic<T, U>;
  type YmdKey = _YmdKey;
  type DatetimeRangeMapKey = _DatetimeRangeMapKey;
  type AnswerSelectionMapKey = _AnswerSelectionMapKey;
}
