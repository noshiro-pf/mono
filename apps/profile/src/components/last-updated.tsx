import { constant, type JSX } from 'synstate-dom';
import { lastUpdatedAt } from '../assets/index.mjs';

export const LastUpdatedAt = (): JSX.Element => (
  <div>{constant(`（最終更新日：${lastUpdatedAt}）`)}</div>
);
