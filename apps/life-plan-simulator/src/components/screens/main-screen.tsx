import { Card } from 'blueprint-synstate';
import { map } from 'synstate';
import { constant, If, type Bindable, type JSX } from 'synstate-dom';
import { planStore } from '../../store/index.mjs';
import { AppHeader } from './app-header.js';
import { UnsentWritesBar, WriteErrorBar } from './notice-bars.js';
import { Workspace } from './workspace.js';

type Props = Readonly<{
  userName: Bindable<string>;
}>;

/** Shown while signed in: the plans, and the one open. */
export const MainScreen = ({ userName }: Props): JSX.Element => {
  const { plans, currentPlan } = planStore;

  return (
    <main>
      <AppHeader userName={userName} />
      <UnsentWritesBar />
      <WriteErrorBar />
      <If
        cond={currentPlan.pipe(map((p) => p !== undefined))}
        then={<Workspace />}
        else={
          <Card
            aria-busy={plans.pipe(
              map((s) => (s.type === 'loading').toString()),
            )}
          >
            <p
              data-e2e={constant('plans-status')}
              role={plans.pipe(
                map((s) => (s.type === 'error' ? 'alert' : 'status')),
              )}
            >
              {plans.pipe(
                map((s) =>
                  s.type === 'loading'
                    ? '読み込み中…'
                    : s.type === 'error'
                      ? s.message
                      : 'プランがありません。「新しいプラン」から作成してください。',
                ),
              )}
            </p>
          </Card>
        }
      />
    </main>
  );
};
