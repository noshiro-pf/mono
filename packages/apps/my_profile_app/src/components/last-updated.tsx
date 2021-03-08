import { memoNamed } from '@noshiro/react-utils';
import { lastUpdated } from '../contents';

export const LastUpdated = memoNamed('LastUpdated', () => (
  <div>{`（最終更新日：${lastUpdated}）`}</div>
));
