import { memoNamed } from '@noshiro/preact-utils';
import { lastUpdated } from '../assets';

export const LastUpdated = memoNamed('LastUpdated', () => (
  <div>{`（最終更新日：${lastUpdated}）`}</div>
));
