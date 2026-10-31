import { constant, If, type Bindable, type JSX } from 'synstate-dom';
import { m } from '../i18n/index.mjs';

type Props = Readonly<{
  /** Folded into a `<details>`, for a milestone that already exists. */
  collapsed: Bindable<boolean>;
}>;

/**
 * What a milestone is for, at the top of its dialog: in full while one is being
 * created, folded away once it exists.
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
    <p>{constant(m.milestoneExplanation.what)}</p>
    <ul>
      <li>{constant(m.milestoneExplanation.date)}</li>
      <li>{constant(m.milestoneExplanation.check)}</li>
      <li>{constant(m.milestoneExplanation.dependency)}</li>
    </ul>
    <p>{constant(m.milestoneExplanation.none)}</p>
  </>
);

const HEADING = m.milestoneExplanation.heading;

const HEADING_ID = 'milestone-explanation-heading';
