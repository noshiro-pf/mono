/// <reference path="./globals.d.ts" />

/// <reference types="react" />
/// <reference types="react-dom" />

/// <reference types="vite/client" />

/* eslint-disable @typescript-eslint/no-restricted-imports */
/* eslint-disable import/no-internal-modules */

import {
  type HTMLInputProps as HTMLInputProps_,
  type HTMLSelectProps as HTMLSelectProps_,
  type IconName as IconName_,
  type InputGroupProps as InputGroupProps_,
  type Intent as Intent_,
  type OptionProps as OptionProps_,
  type PopperModifiers as PopperModifiers_,
  type Toaster as Toaster_,
} from '@blueprintjs/core';
import { type DateInputProps } from '@blueprintjs/datetime';
import {
  type AnswerIconIdWithNone as AnswerIconIdWithNone_,
  type AnswerIconId as AnswerIconId_,
  type AnswerIconPoint as AnswerIconPoint_,
  type AnswerIconSetting as AnswerIconSetting_,
  type AnswerIconSettings as AnswerIconSettings_,
  type AnswerId as AnswerId_,
  type AnswerSelection as AnswerSelection_,
  type Answer as Answer_,
  type DatetimeSpecificationEnumType as DatetimeSpecificationEnumType_,
  type EventSchedule as EventSchedule_,
  type NotificationSettings as NotificationSettings_,
  type UserId as UserId_,
  type UserName as UserName_,
  type User as User_,
  type Weight as Weight_,
} from '@noshiro/event-schedule-app-shared';
import {
  type DatetimeRange as DatetimeRange_,
  type DayType as DayType_,
  type HoursMinutes as HoursMinutes_,
  type TimeRange as TimeRange_,
  type YearMonthDate as YearMonthDate_,
  type Ymdhm as Ymdhm_,
} from '@noshiro/io-ts-types';
import { type dict as dict_ } from './constants';
import {
  type AnswerSelectionMapKey as AnswerSelectionMapKey_,
  type DatetimeRangeMapKey as DatetimeRangeMapKey_,
  type YmdKey as YmdKey_,
} from './functions';
import {
  type AuthCredential as AuthCredential_,
  type FireAuthUser as FireAuthUser_,
  type OAuthCredential as OAuthCredential_,
  type UserCredential as UserCredential_,
} from './types/firebase-types-wrapper';

declare global {
  /* @blueprintjs/core */
  type HTMLInputProps = HTMLInputProps_;
  type HTMLSelectProps = HTMLSelectProps_;
  type IconName = IconName_;
  type InputGroupProps = InputGroupProps_;
  type Intent = Intent_;

  type Toaster = Toaster_;
  type OptionProps = OptionProps_;
  type PopperModifiers = PopperModifiers_;

  /* @blueprintjs/datetime */
  type DatePickerShortcut = Readonly<
    ArrayElement<Exclude<DateInputProps['shortcuts'], boolean | undefined>>
  >;

  /* @noshiro/io-ts-types */
  type DatetimeRange = DatetimeRange_;
  type YearMonthDate = YearMonthDate_;
  type Ymdhm = Ymdhm_;
  type DayType = DayType_;
  type HoursMinutes = HoursMinutes_;
  type TimeRange = TimeRange_;

  /* @noshiro/event-schedule-app-shared */
  type Answer = Answer_;
  type AnswerIconId = AnswerIconId_;
  type AnswerIconIdWithNone = AnswerIconIdWithNone_;
  type AnswerIconPoint = AnswerIconPoint_;
  type AnswerIconSetting = AnswerIconSetting_;
  type AnswerIconSettings = AnswerIconSettings_;
  type AnswerId = AnswerId_;
  type AnswerSelection = AnswerSelection_;
  type DatetimeSpecificationEnumType = DatetimeSpecificationEnumType_;
  type EventSchedule = EventSchedule_;
  type NotificationSettings = NotificationSettings_;
  type User = User_;
  type UserId = UserId_;
  type UserName = UserName_;
  type Weight = Weight_;

  /* others */
  const dict: typeof dict_;
  type FireAuthUser = FireAuthUser_;
  type AuthCredential = AuthCredential_;
  type OAuthCredential = OAuthCredential_;
  type UserCredential = UserCredential_;
  type YmdKey = YmdKey_;
  type DatetimeRangeMapKey = DatetimeRangeMapKey_;
  type AnswerSelectionMapKey = AnswerSelectionMapKey_;
}
