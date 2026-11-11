import { https, logger } from 'firebase-functions/v1';
import { Arr } from 'ts-data-forge';
import { postToDiscord } from './discord-webhook.mjs';
import { getDiscordWebhookUrl, getFirebaseConfig } from './env.mjs';
import { createMailOptions, sendEmail } from './setup-mailer.mjs';
import { isSendReportPayload, type SendReportPayload } from './types/index.mjs';

/**
 * The body of `sendReport`: delivers the report (by mail, and to Discord when a
 * webhook is configured) unless the budget is used up. It answers with an
 * `HttpsError` whenever the report reached no one, the report then going to the
 * function's log, so that the client shows its error toast rather than its
 * success one.
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
    logger.error('Error report (not delivered):', payload.error, error);

    throw new https.HttpsError(
      'internal',
      'The error report was not delivered.',
    );
  }
};

export const sendReportImpl = async ({
  error,
}: SendReportPayload): Promise<void> => {
  const config = getFirebaseConfig();

  const text = error.split(String.raw`\n`).join('\n');

  const webhookUrl = getDiscordWebhookUrl();

  const mail = {
    name: 'mail',
    send: () =>
      sendEmail(
        createMailOptions({
          to: config.gmail['email-address-for-error-log'],
          subject,
          text,
        }),
      ),
  } as const;

  await deliverToAny(
    error,
    webhookUrl === ''
      ? [mail]
      : [
          mail,
          {
            name: 'Discord',
            send: () => postToDiscord({ webhookUrl, title: subject, text }),
          },
        ],
  );
};

/**
 * Sends `report` every way in `ways` at once, and resolves once all have
 * settled if any delivered it: a report that reached one place is delivered.
 * Each way that failed is logged with the report. Rejects when none delivered
 * it.
 */
export const deliverToAny = async (
  report: string,
  ways: readonly Readonly<{ name: string; send: () => Promise<void> }>[],
): Promise<void> => {
  const results = await Promise.allSettled(
    // `async` so that a `send` that throws rejects rather than throwing here.
    ways.map(async ({ send }) => send()),
  );

  const failures = Arr.generate(function* () {
    for (const [i, way] of ways.entries()) {
      const result = results[i];

      if (result?.status === 'rejected') {
        yield { name: way.name, reason: result.reason };
      }
    }
  });

  for (const { name, reason } of failures) {
    logger.error(`Error report (${name} failed):`, report, reason);
  }

  if (failures.length === ways.length) {
    throw new Error('The error report was delivered nowhere.');
  }
};

const subject = 'エラー報告がありました。';
