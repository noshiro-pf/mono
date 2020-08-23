import React, { useMemo } from 'react';
import { contentsUrls } from '../../constants/contents-urls';
import { writingInfo } from '../../types/writings';
import { convertJsonData } from '../../utils/convert-json-data';
import { useFetchedJsonData } from '../../utils/hooks';
import { memoNamed } from '../../utils/react/memo-named';
import { WritingsView } from './writings-view';

export const Writings = memoNamed('Writings', () => {
  const data = useFetchedJsonData(contentsUrls.writingsJson);

  const listElements = useMemo(
    //
    () => convertJsonData(data, (data) => data?.listElements, writingInfo),
    [data]
  );

  return <WritingsView listElements={listElements} />;
});
