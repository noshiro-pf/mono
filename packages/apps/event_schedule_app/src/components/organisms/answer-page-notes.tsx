import { memoNamed } from '@noshiro/react-utils';
import urlRegex from 'url-regex';
import { splitStringByWhitespace } from '../../utils';

type Props = Readonly<{
  notes: string;
}>;

const convertUrlStringToAnchorElement = (
  str: string
): JSX.IntrinsicElements['a'] | JSX.IntrinsicElements['span'] =>
  urlRegex({ exact: true, strict: false }).test(str) ? (
    <a href={str} rel='noopener noreferrer' target='_blank'>
      {str}
    </a>
  ) : (
    <span>{str}</span>
  );

export const AnswerPageNotes = memoNamed<Props>(
  'AnswerPageNotes',
  ({ notes }) => (
    <>
      {IList.map(splitStringByWhitespace(notes), (str, i) => (
        <span key={i}>{convertUrlStringToAnchorElement(str)} </span>
      ))}
    </>
  )
);
