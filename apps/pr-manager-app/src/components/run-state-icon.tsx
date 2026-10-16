import { memoNamed } from 'preact-utils';

type Props = Readonly<{
  /** Which glyph: the one GitHub's Actions tab draws for the state. */
  kind: 'running' | 'queued';
  /** The state in words: the tooltip, and what a screen reader says. */
  label: string;
}>;

/**
 * A workflow run's state as the Actions tab draws it: a ring turning for one
 * in progress, a dot for one queued. Both in the status amber, which is what
 * GitHub gives them. The ring turns whatever the reader's motion setting
 * (`index.css`).
 *
 * The glyph is `aria-hidden` and the word is beside it, hidden from sight
 * rather than from a screen reader, as a badge's word is beside its icon
 * (`badge-icon.tsx`).
 */
export const RunStateIcon = memoNamed<Props>(
  'RunStateIcon',
  ({ kind, label }) => (
    <span className={'run-state-icon'} data-kind={kind} title={label}>
      <svg aria-hidden={'true'} focusable={'false'} viewBox={'0 0 16 16'}>
        {kind === 'running' ? (
          <>
            <circle
              className={'run-state-track'}
              cx={8}
              cy={8}
              fill={'none'}
              r={6}
              strokeWidth={2}
            />
            <path
              d={'M8 2a6 6 0 0 1 6 6'}
              fill={'none'}
              strokeLinecap={'round'}
              strokeWidth={2}
            />
          </>
        ) : (
          <circle cx={8} cy={8} r={4} />
        )}
      </svg>

      <span className={'visually-hidden'}>{label}</span>
    </span>
  ),
);
