import { logger } from 'firebase-functions';
import { createTransport } from 'nodemailer';
import { firebaseConfig } from './env.mjs';

const mailTransport = createTransport({
  service: 'gmail',
  auth: {
    user: firebaseConfig.gmail.email,
    pass: firebaseConfig.gmail['app-password'],
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
  from: `event-schedule-app <${firebaseConfig.gmail.email}>`,
  to,
  subject,
  text,
});

export const sendEmail = async (mailOptions: MailOptions): Promise<void> => {
  await mailTransport.sendMail(mailOptions).catch(logger.error);

  logger.log(
    `email has successfully sent from ${firebaseConfig.gmail.email} to ${mailOptions.to}.`,
  );
};
