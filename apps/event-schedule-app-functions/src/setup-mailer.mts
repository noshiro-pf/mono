import { logger } from 'firebase-functions/v1';
import { AsyncLocalStorage } from 'node:async_hooks';
import { createTransport, type Transporter } from 'nodemailer';
import { getFirebaseConfig, getMailDelivery } from './env.mjs';

type MailOptions = Readonly<{
  from: string;
  to: string;
  subject: string;
  text: string;
}>;

export const createMailOptions = ({
  text,
  to,
  subject,
}: Readonly<{
  text: string;
  to: string;
  subject: string;
}>): MailOptions =>
  ({
    from: `event-schedule-app <${getFirebaseConfig().gmail.email}>`,
    to,
    subject,
    text,
  }) as const;

/**
 * Sends a mail, and rejects when it does not go out, so that the caller can say
 * so. Inside {@link withMailSession} it goes over the session's transport;
 * otherwise over one of its own, opened for it alone. Under the emulator's
 * dummy secret (`"mail-delivery": "log"`) it logs the mail instead and opens
 * nothing: there is no account to log in to.
 */
export const sendEmail = async (mailOptions: MailOptions): Promise<void> => {
  if (getMailDelivery() === 'log') {
    logger.log(
      `mail not sent (mail-delivery is "log"): to ${mailOptions.to}, subject ${mailOptions.subject}`,
    );

    return;
  }

  const { gmail } = getFirebaseConfig();

  const session = mailSession.getStore();

  const mailTransport =
    session === undefined ? openTransport(false) : session.transport();

  // A failure rejects, so that the caller can say the mail did not go out.
  await mailTransport.sendMail(mailOptions);

  logger.log(
    `email has successfully sent from ${gmail.email} to ${mailOptions.to}.`,
  );
};

/**
 * Runs `run` with the mails it sends through {@link sendEmail} going over one
 * pooled transport, opened at the first send and closed once `run` settles, so
 * that they share the SMTP connection and its handshake with Gmail rather than
 * paying it for each mail. For a run that sends one mail after another within a
 * time budget, such as the closing mails: each handshake would be taken from
 * that budget.
 *
 * The transport lives as long as `run` and no longer. One kept for the instance
 * would hold sockets across the freeze between invocations, which Gmail may
 * have closed by the next.
 */
export const withMailSession = async <A,>(
  run: () => Promise<A>,
): Promise<A> => {
  const mut_opened: { transport: Transporter | undefined } = {
    transport: undefined,
  };

  try {
    return await mailSession.run(
      {
        transport: () => {
          mut_opened.transport ??= openTransport(true);

          return mut_opened.transport;
        },
      },
      run,
    );
  } finally {
    mut_opened.transport?.close();
  }
};

/**
 * The transport of a {@link withMailSession}, opened by the first mail that asks
 * for it.
 */
type MailSession = Readonly<{ transport: () => Transporter }>;

const mailSession = new AsyncLocalStorage<MailSession>();

/**
 * A transport to Gmail with the secret's account. A pooled one keeps its
 * connections open for the mails after the first; one that is not opens a
 * connection for each mail.
 */
const openTransport = (pool: boolean): Transporter => {
  const { gmail } = getFirebaseConfig();

  return createTransport({
    service: 'gmail',
    ...(pool ? { pool: true } : {}),
    auth: {
      user: gmail.email,
      pass: gmail['app-password'],
    },
  });
};
