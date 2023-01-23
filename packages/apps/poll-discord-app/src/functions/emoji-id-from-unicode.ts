import { emojis } from '../constants';
import { type AnswerType } from '../types';

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
