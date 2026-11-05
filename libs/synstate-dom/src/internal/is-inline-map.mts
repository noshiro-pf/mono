import { hasKey, isRecord } from 'ts-data-forge';
import type { ElementBindable, InlineMap } from '../constant/index.mjs';
import { inlineMapTag } from './inline-map-tag.mjs';

export const isInlineMap = <T,>(
  bindable: ElementBindable<T>,
): bindable is InlineMap<T> =>
  isRecord(bindable) && hasKey(bindable, inlineMapTag);
