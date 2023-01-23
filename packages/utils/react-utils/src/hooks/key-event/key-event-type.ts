import { type KeyboardEvent as ReactKeyboardEvent } from 'react';

export type KeyboardEventType<T = Element> =
  | KeyboardEvent
  | ReactKeyboardEvent<T>;
