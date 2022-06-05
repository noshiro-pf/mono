import type { UserId } from '../types';

export const userIdToMention = (userId: UserId): string => `<@!${userId}>`;
