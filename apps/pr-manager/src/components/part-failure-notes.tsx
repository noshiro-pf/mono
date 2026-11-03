import { constant, For, view, type JSX } from 'synstate-dom';
import type { ReadPart } from '../load-report.mjs';
import { failureNotes } from '../part-failures.mjs';
import { reader } from '../store/index.mjs';

type Props = Readonly<{
  /** The parts the panel is drawn from. */
  parts: readonly ReadPart[];
}>;

/**
 * What a panel says of its parts the last read could not read, under its title:
 * said in each panel drawn from the part and in no other, so that a query GitHub
 * timed out takes nothing off the panels it does not feed. Not a live region: a
 * poll that fails again would announce it again every minute.
 */
export const PartFailureNotes = ({ parts }: Props): JSX.Element => (
  <For
    items={view(reader.failed, (failed) => failureNotes(failed, parts))}
    key={(note) => note}
  >
    {(note$) => (
      <p class={constant('section-note')} data-status={constant('critical')}>
        {note$}
      </p>
    )}
  </For>
);
