import { constant, If, type Bindable, type JSX } from 'synstate-dom';

type Props = Readonly<{
  /** Folded into a `<details>`, for a milestone that already exists. */
  collapsed: Bindable<boolean>;
}>;

/**
 * What a milestone is for, at the top of its dialog: in full while one is
 * being created, folded away once it exists.
 */
export const MilestoneExplanation = ({ collapsed }: Props): JSX.Element => (
  <If
    cond={collapsed}
    then={
      <details
        class={constant('bp6-callout bp6-intent-primary milestone-explanation')}
        data-e2e={constant('milestone-explanation')}
      >
        <summary class={constant('milestone-explanation-summary')}>
          {constant(HEADING)}
        </summary>
        <ExplanationBody />
      </details>
    }
    else={
      <section
        aria-labelledby={constant(HEADING_ID)}
        class={constant('bp6-callout bp6-intent-primary milestone-explanation')}
        data-e2e={constant('milestone-explanation')}
      >
        <h3 class={constant('bp6-heading')} id={constant(HEADING_ID)}>
          {constant(HEADING)}
        </h3>
        <ExplanationBody />
      </section>
    }
  />
);

const ExplanationBody = (): JSX.Element => (
  <>
    <p>
      {constant(
        '作業そのものではなく、タスクが着手可能になるタイミングを表す目印です（所要時間ゼロ）。下の到達条件がすべて満たされると「到達」し、このマイルストーンに依存するタスクが着手可（Ready）になります。',
      )}
    </p>
    <ul>
      <li>
        {constant(
          '日時: その日時になると到達します（例: 10/9 以降に着手したいタスクの前に置く）。',
        )}
      </li>
      <li>
        {constant(
          '手動チェック: 「解消」を押すと到達します（例: 先方の返答待ちなど、外部要因のブロッカー）。',
        )}
      </li>
      <li>
        {constant(
          '依存: タスクの完了・開始や、ほかのマイルストーンの到達を待ちます（例: 複数のタスクの完了をまとめた「実装完了」）。',
        )}
      </li>
    </ul>
    <p>
      {constant(
        '条件を何も指定しないと、作成した時点で到達済みになります。条件が後から満たされなくなった場合（依存先のタスクを差し戻したなど）は、未到達に戻ります。',
      )}
    </p>
  </>
);

const HEADING = 'マイルストーンとは';

const HEADING_ID = 'milestone-explanation-heading';
