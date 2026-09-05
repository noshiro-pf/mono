import { memoNamed } from 'preact-utils';
import { lastUpdatedAt } from '../assets/index.mjs';

export const LastUpdatedAt = memoNamed('LastUpdatedAt', () => (
  <div>{`（最終更新日：${lastUpdatedAt}）`}</div>
));
