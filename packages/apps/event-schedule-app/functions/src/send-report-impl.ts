import { firebaseConfig } from './env';
import { createMailOptions, sendEmail } from './setup-mailer';
import { type SendReportPayload } from './types';

export const sendReportImpl = ({ error }: SendReportPayload): Promise<void> =>
  sendEmail(
    createMailOptions({
      to: firebaseConfig.gmail['email-address-for-error-log'],
      subject: `エラー報告がありました。`,
      text: error.split('\\n').join('\n'),
    })
  );
