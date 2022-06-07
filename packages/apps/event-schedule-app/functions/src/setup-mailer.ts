import { config, logger } from 'firebase-functions';
import { createTransport } from 'nodemailer';
import { fillGmailConfig } from './type-check';

export const gmailConfig: Readonly<{
  email: string;
  password: string;
}> = fillGmailConfig(config()).gmail;

export const mailTransport = createTransport({
  service: 'gmail',
  auth: {
    user: gmailConfig.email,
    pass: gmailConfig.password,
  },
});

export type MailOptions = Readonly<{
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
  from: `event-schedule-app <${gmailConfig.email}>`,
  to,
  subject,
  text,
});

export const sendEmail = async (mailOptions: MailOptions): Promise<void> => {
  await mailTransport.sendMail(mailOptions).catch(logger.error);

  logger.log(
    `email has successfully sent from ${gmailConfig.email} to ${mailOptions.to}.`
  );
};
