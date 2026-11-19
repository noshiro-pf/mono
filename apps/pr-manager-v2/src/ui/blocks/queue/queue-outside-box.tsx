import { map, type InitializedObservable } from 'synstate';
import { constant, type JSX } from 'synstate-dom';
import type { OutsideItem } from '../../../domain/index.mjs';
import { ExternalLink } from '../../common/index.mjs';

/**
 * One pull request outside the row: its number, why in a word and whose it is
 * to move, with the rest on hover.
 */
export const QueueOutsideBox = ({
  item,
}: Readonly<{ item: InitializedObservable<OutsideItem> }>): JSX.Element => (
  <li class={constant('queue-outside-node')}>
    <ExternalLink
      class={constant('queue-link')}
      href={item.pipe(map(({ url }) => url))}
      title={item.pipe(
        map(
          ({ number, title, why, whose, detail }) =>
            `#${number} ${title}\n${why}, ${whose}: ${detail}`,
        ),
      )}
    >
      <span class={constant('queue-number')}>
        {item.pipe(map(({ number }) => `#${number}`))}
      </span>
      <span class={constant('queue-note')}>
        {item.pipe(map(({ why, whoseWord }) => `${why} · ${whoseWord}`))}
      </span>
    </ExternalLink>
  </li>
);
