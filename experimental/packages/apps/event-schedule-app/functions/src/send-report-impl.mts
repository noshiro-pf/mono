import { firebaseConfig } from './env.mjs';
import { createMailOptions, sendEmail } from './setup-mailer.mjs';
import { type SendReportPayload } from './types/index.mjs';

export const sendReportImpl = ({ error }: SendReportPayload): Promise<void> =>
  sendEmail(
    createMailOptions({
      to: firebaseConfig.gmail['email-address-for-error-log'],
      subject: `エラー報告がありました。`,
      text: error.split(String.raw`\n`).join('\n'),
    }),
  );
