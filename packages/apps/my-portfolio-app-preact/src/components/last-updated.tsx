import { lastUpdatedAt } from '../assets';

export const LastUpdatedAt = memoNamed('LastUpdatedAt', () => (
  <div>{`（最終更新日：${lastUpdatedAt}）`}</div>
));
