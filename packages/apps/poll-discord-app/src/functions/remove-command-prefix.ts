import type { triggerCommand } from '../constants';

export const removeCommandPrefix = (
  message: string,
  command: ValueOf<typeof triggerCommand>
): string => message.replace(new RegExp(`^${command} `, 'u'), '');
