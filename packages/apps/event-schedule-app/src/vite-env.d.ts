/// <reference path="./globals.d.ts" />

/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />

/// <reference types="vite/client" />

/* eslint-disable @typescript-eslint/no-restricted-imports */
/* eslint-disable import/no-internal-modules */

import {
  type HTMLInputProps as _HTMLInputProps,
  type HTMLSelectProps as _HTMLSelectProps,
  type IconName as _IconName,
  type InputGroupProps as _InputGroupProps,
  type Intent as _Intent,
  type OptionProps as _OptionProps,
  type PopperModifiers as _PopperModifiers,
  type Toaster as _Toaster,
} from '@blueprintjs/core';
import { type DateInputProps } from '@blueprintjs/datetime';
import {
  type Answer as _Answer,
  type AnswerIconId as _AnswerIconId,
  type AnswerIconIdWithNone as _AnswerIconIdWithNone,
  type AnswerIconPoint as _AnswerIconPoint,
  type AnswerIconSetting as _AnswerIconSetting,
  type AnswerIconSettings as _AnswerIconSettings,
  type AnswerId as _AnswerId,
  type AnswerSelection as _AnswerSelection,
  type DatetimeRange as _DatetimeRange,
  type DatetimeSpecificationEnumType as _DatetimeSpecificationEnumType,
  type DayType as _DayType,
  type EventSchedule as _EventSchedule,
  type HoursMinutes as _HoursMinutes,
  type NotificationSettings as _NotificationSettings,
  type TimeRange as _TimeRange,
  type User as _User,
  type UserId as _UserId,
  type UserName as _UserName,
  type Weight as _Weight,
  type YearMonthDate as _YearMonthDate,
  type Ymdhm as _Ymdhm,
} from '@noshiro/event-schedule-app-shared';
import { type dict as _dict } from './constants';
import {
  type AnswerSelectionMapKey as _AnswerSelectionMapKey,
  type DatetimeRangeMapKey as _DatetimeRangeMapKey,
  type YmdKey as _YmdKey,
} from './functions';
import {
  type AuthCredential as _AuthCredential,
  type FireAuthUser as _FireAuthUser,
  type OAuthCredential as _OAuthCredential,
  type UserCredential as _UserCredential,
} from './types/firebase-types-wrapper';

declare global {
  /* @blueprintjs/core */
  type HTMLInputProps = _HTMLInputProps;
  type HTMLSelectProps = _HTMLSelectProps;
  type IconName = _IconName;
  type InputGroupProps = _InputGroupProps;
  type Intent = _Intent;

  type Toaster = _Toaster;
  type OptionProps = _OptionProps;
  type PopperModifiers = _PopperModifiers;

  /* @blueprintjs/datetime */
  type DatePickerShortcut = Readonly<
    ArrayElement<Exclude<DateInputProps['shortcuts'], boolean | undefined>>
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
  type YmdKey = _YmdKey;
  type DatetimeRangeMapKey = _DatetimeRangeMapKey;
  type AnswerSelectionMapKey = _AnswerSelectionMapKey;
}
