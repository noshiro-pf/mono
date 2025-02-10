import { defineString } from 'firebase-functions/params';

export const email = defineString('GMAIL_APP_PASSWORD');
export const password = defineString('GMAIL_EMAIL_ADDRESS_FOR_ERROR_LOG');
export const appPassword = defineString('GMAIL_EMAIL');
export const emailAddressForErrorLog = defineString('GMAIL_PASSWORD');
