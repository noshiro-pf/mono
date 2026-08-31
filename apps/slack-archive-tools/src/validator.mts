import { Arr, Result } from 'ts-data-forge';
import { type JsonValue } from 'ts-type-forge';
import { Message } from './types.mjs';

export const validateJsonObject = (
  content: JsonValue,
  srcFile: string,
): content is readonly JsonValue[] => {
  if (!Arr.isArray(content)) {
    console.error('content is not array');

    console.log({ content, srcFile });

    return false;
  }

  for (const element of content) {
    const result = Message.validate(element);

    if (Result.isErr(result)) {
      console.error(result.value);

      console.log({ element, srcFile });

      return false;
    }
  }

  return true;
};
