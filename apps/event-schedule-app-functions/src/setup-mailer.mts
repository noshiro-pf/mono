import { logger } from 'firebase-functions/v1';
import { createTransport } from 'nodemailer';
import { getFirebaseConfig } from './env.mjs';

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

export const sendEmail = async (mailOptions: MailOptions): Promise<void> => {
  const { gmail } = getFirebaseConfig();

  const mailTransport = createTransport({
    service: 'gmail',
    auth: {
      user: gmail.email,
      pass: gmail['app-password'],
    },
  });

  await mailTransport.sendMail(mailOptions).catch(logger.error);

  logger.log(
    `email has successfully sent from ${gmail.email} to ${mailOptions.to}.`,
  );
};
