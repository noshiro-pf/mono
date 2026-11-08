import { https, logger } from 'firebase-functions/v1';
import { getFirebaseConfig } from './env.mjs';
import { createMailOptions, sendEmail } from './setup-mailer.mjs';
import { isSendReportPayload, type SendReportPayload } from './types/index.mjs';

/**
 * The body of `sendReport`: mails the report unless the budget is used up. It
 * answers with an `HttpsError` whenever no mail went out, the report then going
 * to the function's log, so that the client shows its error toast rather than
 * its success one.
 */
export const handleSendReport = async (
  payload: unknown,
  deps: Readonly<{
    withinBudget: () => boolean;
    send: (report: SendReportPayload) => Promise<void>;
  }>,
): Promise<void> => {
  if (!isSendReportPayload(payload)) {
    throw new https.HttpsError(
      'invalid-argument',
      'The payload type is invalid.',
    );
  }

  if (!deps.withinBudget()) {
    logger.error('Error report (mail budget used up):', payload.error);

    throw new https.HttpsError(
      'resource-exhausted',
      'Too many error reports for now; this one was logged, not mailed.',
    );
  }

  try {
    await deps.send(payload);
  } catch (error) {
    logger.error('Error report (mail failed):', payload.error, error);

    throw new https.HttpsError('internal', 'The error report was not mailed.');
  }
};

export const sendReportImpl = async ({
  error,
}: SendReportPayload): Promise<void> => {
  await sendEmail(
    createMailOptions({
      to: getFirebaseConfig().gmail['email-address-for-error-log'],
      subject: 'エラー報告がありました。',
      text: error.split(String.raw`\n`).join('\n'),
    }),
  );
};
