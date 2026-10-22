import { hasKey, isRecord } from 'ts-data-forge';
import type { Bindable, View } from '../constant/index.mjs';
import { viewTag } from './view-tag.mjs';

export const isView = <T,>(bindable: Bindable<T>): bindable is View<T> =>
  isRecord(bindable) && hasKey(bindable, viewTag);
