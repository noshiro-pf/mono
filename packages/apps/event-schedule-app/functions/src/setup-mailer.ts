import { logger } from 'firebase-functions';
import { createTransport } from 'nodemailer';
import { appPassword, email } from './env.js';

const mailTransport = (): ReturnType<typeof createTransport> =>
  createTransport({
    service: 'gmail',
    auth: {
      user: email.value(),
      pass: appPassword.value(),
    },
  });

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
}>): MailOptions => ({
  from: `event-schedule-app <${email.value()}>`,
  to,
  subject,
  text,
});

export const sendEmail = async (mailOptions: MailOptions): Promise<void> => {
  await mailTransport().sendMail(mailOptions).catch(logger.error);

  logger.log(
    `email has successfully sent from ${email.value()} to ${mailOptions.to}.`,
  );
};
