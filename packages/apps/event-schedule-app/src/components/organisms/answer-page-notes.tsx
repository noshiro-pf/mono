import urlRegex from 'url-regex';
import { splitStringByWhitespace } from '../../utils';

type Props = Readonly<{
  notes: string;
}>;

export const AnswerPageNotes = memoNamed<Props>(
  'AnswerPageNotes',
  ({ notes }) => (
    <>{splitStringByWhitespace(notes).map(convertUrlStringToAnchorElement)}</>
  )
);

const regex = urlRegex({ exact: true, strict: false });

const convertUrlStringToAnchorElement = (
  str: string,
  key: React.Key
): React.JSX.IntrinsicElements['a'] | React.JSX.IntrinsicElements['span'] =>
  regex.test(str) ? (
    <a key={key} href={str} rel={'noopener noreferrer'} target={'_blank'}>
      {str}
    </a>
  ) : (
    <span key={key}>{str}</span>
  );
