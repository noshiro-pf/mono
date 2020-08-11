import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { memoNamed } from '../../utils/react/memo-named';

export const MarkdownPage = memoNamed<{ url: string }>(
  'MarkdownPage',
  ({ url }) => {
    const [mdText, setMdText] = useState('');

    useEffect(() => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      fetch(url)
        .then((response) => response.text())
        .then(setMdText);
    }, [url]);

    return <ReactMarkdown source={mdText} />;
  }
);
