import { createState } from 'synstate';
import {
  constant,
  For,
  If,
  mapBindable,
  view,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { planStore, sessionStore } from '../../store/index.mjs';

type Props = Readonly<{
  userName: Bindable<string>;
}>;

/**
 * プランの切り替え・作成・複製・名前の変更・削除と、サインアウト。プランは
 * どれも同じアカウントに保存され、ここで選んだものを下のタブで編集する。
 */
export const AppHeader = ({ userName }: Props): JSX.Element => {
  const [confirmingDelete$, setConfirmingDelete] = createState(false);

  const plans$ = view(planStore.plans, (s) =>
    s.type === 'loaded' ? s.plans : [],
  );

  const noPlan$ = view(planStore.currentPlan, (p) => p === undefined);

  return (
    <header class={constant('app-header')}>
      <h1>{constant('ライフプランシミュレーター')}</h1>
      <div class={constant('plan-bar')}>
        <label class={constant('field')}>
          <span>{constant('プラン')}</span>
          <select
            data-e2e={constant('plan-select')}
            disabled={noPlan$}
            onChange={(e) => {
              planStore.selectPlan(e.currentTarget.value);

              setConfirmingDelete(false);
            }}
          >
            <For items={plans$} key={(plan) => plan.id}>
              {(plan$) => (
                <option
                  value={view(plan$, (p) => p.id)}
                  selected={view(
                    planStore.currentPlan,
                    (current) => current?.id === plan$.getSnapshot().value.id,
                  )}
                >
                  {view(plan$, (p) => p.name)}
                </option>
              )}
            </For>
          </select>
        </label>
        <label class={constant('field')}>
          <span>{constant('プラン名')}</span>
          <input
            type={constant('text')}
            data-e2e={constant('plan-name')}
            disabled={noPlan$}
            value={view(planStore.currentPlan, (p) => p?.name ?? '')}
            onChange={(e) => {
              planStore.renamePlan(e.currentTarget.value);
            }}
          />
        </label>
        <div class={constant('actions')}>
          <button
            type={constant('button')}
            data-e2e={constant('plan-create')}
            onClick={() => {
              planStore.createPlan();

              setConfirmingDelete(false);
            }}
          >
            {constant('新しいプラン')}
          </button>
          <button
            type={constant('button')}
            data-e2e={constant('plan-duplicate')}
            disabled={noPlan$}
            onClick={() => {
              planStore.duplicatePlan();

              setConfirmingDelete(false);
            }}
          >
            {constant('複製')}
          </button>
          <If
            cond={confirmingDelete$}
            then={
              <span class={constant('actions')}>
                {view(
                  planStore.currentPlan,
                  (p) => `「${p?.name ?? ''}」を削除しますか？`,
                )}
                <button
                  type={constant('button')}
                  data-e2e={constant('plan-delete-confirm')}
                  class={constant('danger')}
                  onClick={() => {
                    planStore.deletePlan();

                    setConfirmingDelete(false);
                  }}
                >
                  {constant('削除する')}
                </button>
                <button
                  type={constant('button')}
                  onClick={() => {
                    setConfirmingDelete(false);
                  }}
                >
                  {constant('やめる')}
                </button>
              </span>
            }
            else={
              <button
                type={constant('button')}
                data-e2e={constant('plan-delete')}
                disabled={noPlan$}
                onClick={() => {
                  setConfirmingDelete(true);
                }}
              >
                {constant('削除')}
              </button>
            }
          />
        </div>
      </div>
      <div class={constant('account')}>
        <span class={constant('note')}>{userName}</span>
        <button
          type={constant('button')}
          data-e2e={constant('sign-out')}
          disabled={view(sessionStore.signOutState, (s) => s !== 'idle')}
          title={mapBindable(userName, (name) => `${name} としてサインイン中`)}
          onClick={sessionStore.signOut}
        >
          {view(sessionStore.signOutState, (s) =>
            s === 'waiting' ? 'サインアウト中…' : 'サインアウト',
          )}
        </button>
      </div>
    </header>
  );
};
