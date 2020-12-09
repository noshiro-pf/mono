import { memoNamed } from '@mono/react-utils';
import React from 'react';
import { lastUpdated } from '../contents/last-updated';

export const LastUpdated = memoNamed('LastUpdated', () => (
  <div>{`（最終更新日：${lastUpdated}）`}</div>
));
