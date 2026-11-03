import {
  constant,
  For,
  If,
  mapBindable,
  view,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { isHttpUrl, splitStringByWhitespace } from '../../utils/index.mjs';

type Props = Readonly<{ notes: Bindable<string> }>;

/** The event's notes, each http or https URL in them a link. */
export const AnswerPageNotes = ({ notes }: Props): JSX.Element => (
  <For items={mapBindable(notes, splitStringByWhitespace)} key={(_, i) => i}>
    {(word$) => (
      <If
        cond={view(word$, isHttpUrl)}
        then={
          <a
            href={view(word$, linkHref)}
            rel={constant('noopener noreferrer')}
            target={constant('_blank')}
          >
            {word$}
          </a>
        }
        else={<span>{word$}</span>}
      />
    )}
  </For>
);

/**
 * Checked again rather than trusting `cond`: `For` keys by index, so a word can
 * change in place, and the link must never carry a non-http one, even before
 * `If` swaps it for plain text.
 */
const linkHref = (word: string): string => (isHttpUrl(word) ? word : '');
