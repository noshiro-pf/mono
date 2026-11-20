import type { StrictPick } from 'ts-type-forge';
import type { EventScheduleSettingCommonState } from '../types/index.mjs';

/**
 * The notification email a settings page writes: the signed-in account's
 * verified one while notifications are on (`''` when it has none, and nothing
 * is written), and `undefined` while they are off. The email typed into an
 * earlier version of the form, or confirmed in the edit page's dialog, is not
 * it.
 */
export const notificationEmailToSave = ({
  notificationSettingsWithEmail,
  notificationEmail,
}: StrictPick<
  EventScheduleSettingCommonState,
  'notificationEmail' | 'notificationSettingsWithEmail'
>): string | undefined =>
  notificationSettingsWithEmail === undefined
    ? undefined
    : (notificationEmail ?? '');

/**
 * Where the notifications of an event made by `user` go: the email of their
 * account, once it is verified. `undefined` when signed out or not verified,
 * when the Firestore rules take no notification email, and so an event can have
 * no notifications.
 */
export const notificationEmailOf = (
  user: Readonly<{ email: string | null; emailVerified: boolean }> | undefined,
): string | undefined =>
  user?.emailVerified === true && user.email !== null && user.email !== ''
    ? user.email
    : undefined;
