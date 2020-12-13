import * as functions from 'firebase-functions';
import { createTransport } from 'nodemailer';

export const gmailConfig: {
  email: string;
  password: string;
} = (functions.config() as {
  gmail: { email: string; password: string };
}).gmail;

export const mailTransport = createTransport({
  service: 'gmail',
  auth: {
    user: gmailConfig.email,
    pass: gmailConfig.password,
  },
});

export type MailOptions = {
  from: string;
  to: string;
  subject: string;
  text: string;
};

export const createMailOptions = ({
  text,
  to,
  subject,
}: {
  text: string;
  to: string;
  subject: string;
}): MailOptions => ({
  from: `event-schedule-app <${gmailConfig.email}>`,
  to,
  subject,
  text,
});

export const sendEmail = async (mailOptions: MailOptions): Promise<void> => {
  await mailTransport.sendMail(mailOptions).catch(functions.logger.error);

  functions.logger.log(
    `email has successfully sent from ${gmailConfig.email} to ${mailOptions.to}.`
  );
};
