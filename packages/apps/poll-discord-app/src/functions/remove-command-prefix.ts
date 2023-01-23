import { type triggerCommand } from '../constants';

export const removeCommandPrefix = (
  message: string,
  command: ValueOf<typeof triggerCommand>
  // eslint-disable-next-line security/detect-non-literal-regexp
): string => message.replace(new RegExp(`^${command} `, 'u'), '');
