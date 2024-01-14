import { emojis } from '../constants.mjs';
import { type AnswerType } from '../types/index.mjs';

export const emojiIdFromUnicode = (unicode: string): AnswerType | undefined => {
  switch (unicode) {
    case emojis.good.unicode:
      return 'good';
    case emojis.fair.unicode:
      return 'fair';
    case emojis.poor.unicode:
      return 'poor';
    default:
      return undefined;
  }
};
