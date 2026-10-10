import { memoNamed } from 'preact-utils';

type Props = Readonly<{
  /** Folded into a `<details>`, for a milestone that already exists. */
  collapsed: boolean;
}>;

/**
 * What a milestone is for, at the top of its dialog: in full while one is
 * being created, folded away once it exists.
 */
export const MilestoneExplanation = memoNamed<Props>(
  'MilestoneExplanation',
  ({ collapsed }) => {
    const body = (
      <>
        <p>
          {
            '作業そのものではなく、タスクが着手可能になるタイミングを表す目印です（所要時間ゼロ）。下の到達条件がすべて満たされると「到達」し、このマイルストーンに依存するタスクが着手可（Ready）になります。'
          }
        </p>
        <ul>
          <li>
            {
              '日時: その日時になると到達します（例: 10/9 以降に着手したいタスクの前に置く）。'
            }
          </li>
          <li>
            {
              '手動チェック: 「解消」を押すと到達します（例: 先方の返答待ちなど、外部要因のブロッカー）。'
            }
          </li>
          <li>
            {
              '依存: タスクの完了・開始や、ほかのマイルストーンの到達を待ちます（例: 複数のタスクの完了をまとめた「実装完了」）。'
            }
          </li>
        </ul>
        <p>
          {
            '条件を何も指定しないと、作成した時点で到達済みになります。条件が後から満たされなくなった場合（依存先のタスクを差し戻したなど）は、未到達に戻ります。'
          }
        </p>
      </>
    );

    return collapsed ? (
      <details
        className={'bp6-callout bp6-intent-primary milestone-explanation'}
        data-e2e={'milestone-explanation'}
      >
        <summary className={'milestone-explanation-summary'}>{HEADING}</summary>
        {body}
      </details>
    ) : (
      <section
        aria-labelledby={HEADING_ID}
        className={'bp6-callout bp6-intent-primary milestone-explanation'}
        data-e2e={'milestone-explanation'}
      >
        <h3 className={'bp6-heading'} id={HEADING_ID}>
          {HEADING}
        </h3>
        {body}
      </section>
    );
  },
);

const HEADING = 'マイルストーンとは';

const HEADING_ID = 'milestone-explanation-heading';
