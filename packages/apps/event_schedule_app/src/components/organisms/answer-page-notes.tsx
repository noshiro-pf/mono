import { memoNamed } from '@noshiro/react-utils';
import urlRegex from 'url-regex';
import { splitStringByWhitespace } from '../../utils/split-string-by-whitespace';

type Props = Readonly<{
  notes: string;
}>;

const convertUrlStringToAnchorElement = (
  str: string
): JSX.IntrinsicElements['a'] | JSX.IntrinsicElements['span'] =>
  urlRegex({ exact: true, strict: false }).test(str) ? (
    <a href={str} target='_blank' rel='noopener noreferrer'>
      {str}
    </a>
  ) : (
    <span>{str}</span>
  );

export const AnswerPageNotes = memoNamed<Props>(
  'AnswerPageNotes',
  ({ notes }) => (
    <>
      {splitStringByWhitespace(notes).map((str, i) => (
        <span key={i}>{convertUrlStringToAnchorElement(str)} </span>
      ))}
    </>
  )
);
