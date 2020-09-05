import { memoNamed } from '@mono/react-utils';
import React, { useMemo } from 'react';
import { contentsUrls } from '../constants/contents-urls';
import { useFetchedText } from '../utils/hooks';

export const LastUpdated = memoNamed('LastUpdated', () => {
  const data = useFetchedText(contentsUrls.lastUpdated);

  const dateStr = useMemo(
    () => (data === undefined ? '' : new Date(data).toLocaleDateString()),
    [data]
  );

  return <div>{dateStr ? `（最終更新日：${dateStr}）` : ''}</div>;
});
