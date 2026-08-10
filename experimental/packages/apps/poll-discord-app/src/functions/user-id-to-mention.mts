import { type UserId } from '../types/index.mjs';

export const userIdToMention = (userId: UserId): string => `<@!${userId}>`;
