import { memoNamed } from 'react-utils';
import { isHttpUrl, splitStringByWhitespace } from '../../utils/index.mjs';

type Props = Readonly<{ notes: string }>;

export const AnswerPageNotes = memoNamed<Props>(
  'AnswerPageNotes',
  ({ notes }) => (
    <>{splitStringByWhitespace(notes).map(convertUrlStringToAnchorElement)}</>
  ),
);

const convertUrlStringToAnchorElement = (
  str: string,
  key: React.Key,
): React.JSX.IntrinsicElements['a'] | React.JSX.IntrinsicElements['span'] =>
  isHttpUrl(str) ? (
    <a key={key} href={str} rel={'noopener noreferrer'} target={'_blank'}>
      {str}
    </a>
  ) : (
    <span key={key}>{str}</span>
  );
