/// <reference types="vite/client" />

import type {
  IconName as IconName_,
  Intent as Intent_,
  Toaster as Toaster_,
} from 'blueprint-synstate';
import type {
  AnswerIconIdWithNone as AnswerIconIdWithNone_,
  AnswerIconId as AnswerIconId_,
  AnswerIconPoint as AnswerIconPoint_,
  AnswerIconSetting as AnswerIconSetting_,
  AnswerIconSettings as AnswerIconSettings_,
  AnswerId as AnswerId_,
  AnswerSelection as AnswerSelection_,
  Answer as Answer_,
  DatetimeSpecificationEnumType as DatetimeSpecificationEnumType_,
  EventSchedule as EventSchedule_,
  NotificationSettings as NotificationSettings_,
  UserId as UserId_,
  UserName as UserName_,
  User as User_,
  Weight as Weight_,
} from 'event-schedule-app-shared';
import type {
  DatetimeRange as DatetimeRange_,
  DayType as DayType_,
  HoursMinutes as HoursMinutes_,
  TimeRange as TimeRange_,
  YearMonthDate as YearMonthDate_,
  Ymdhm as Ymdhm_,
} from 'ts-fortress-types';
import type {
  AnswerSelectionMapKey as AnswerSelectionMapKey_,
  DatetimeRangeMapKey as DatetimeRangeMapKey_,
  YmdKey as YmdKey_,
} from './functions/index.mjs';
import type {
  AuthCredential as AuthCredential_,
  FireAuthUser as FireAuthUser_,
  OAuthCredential as OAuthCredential_,
  UserCredential as UserCredential_,
} from './types/index.mjs';

declare global {
  /* Vite: the variables this app reads from `.env.*` */
  interface ImportMetaEnv {
    /** `true` to use the Firebase emulators (`api/emulator-mode.mts`). */
    readonly VITE_FIREBASE_EMULATORS?: string;
  }

  /* blueprint-synstate */
  type IconName = IconName_;

  type Intent = Intent_;

  type Toaster = Toaster_;

  /* ts-fortress-types */
  type DatetimeRange = DatetimeRange_;

  type YearMonthDate = YearMonthDate_;

  type Ymdhm = Ymdhm_;

  type DayType = DayType_;

  type HoursMinutes = HoursMinutes_;

  type TimeRange = TimeRange_;

  /* event-schedule-app-shared */
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
  type FireAuthUser = FireAuthUser_;

  type AuthCredential = AuthCredential_;

  type OAuthCredential = OAuthCredential_;

  type UserCredential = UserCredential_;

  type YmdKey = YmdKey_;

  type DatetimeRangeMapKey = DatetimeRangeMapKey_;

  type AnswerSelectionMapKey = AnswerSelectionMapKey_;
}
