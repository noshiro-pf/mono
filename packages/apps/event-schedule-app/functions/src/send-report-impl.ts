import { emailAddressForErrorLog } from './env.js';
import { createMailOptions, sendEmail } from './setup-mailer.js';
import { type SendReportPayload } from './types/index.js';

export const sendReportImpl = ({ error }: SendReportPayload): Promise<void> =>
  sendEmail(
    createMailOptions({
      to: emailAddressForErrorLog.value(),
      subject: `エラー報告がありました。`,
      text: error.split(String.raw`\n`).join('\n'),
    }),
  );
