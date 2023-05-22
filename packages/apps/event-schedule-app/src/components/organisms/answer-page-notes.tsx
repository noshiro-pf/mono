import urlRegex from 'url-regex';
import { splitStringByWhitespace } from '../../utils';

type Props = Readonly<{
  notes: string;
}>;

const convertUrlStringToAnchorElement = (
  str: string,
  key: React.Key
): JSX.IntrinsicElements['a'] | JSX.IntrinsicElements['span'] =>
  urlRegex({ exact: true, strict: false }).test(str) ? (
    <a key={key} href={str} rel={'noopener noreferrer'} target={'_blank'}>
      {str}
    </a>
  ) : (
    <span key={key}>{str}</span>
  );

export const AnswerPageNotes = memoNamed<Props>(
  'AnswerPageNotes',
  ({ notes }) => (
    <>{splitStringByWhitespace(notes).map(convertUrlStringToAnchorElement)}</>
  )
);
