import {
  Button,
  Card,
  HtmlSelect,
  InputGroup,
  Label,
} from 'blueprint-synstate';
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
import { ThemeControl } from './theme-control.js';

type Props = Readonly<{
  userName: Bindable<string>;
}>;

/**
 * プランの切り替え・作成・複製・名前の変更・削除と、テーマの切り替え、
 * サインアウト。プランはどれも同じアカウントに保存され、ここで選んだものを
 * 下のタブで編集する。
 */
export const AppHeader = ({ userName }: Props): JSX.Element => {
  const [confirmingDelete$, setConfirmingDelete] = createState(false);

  const plans$ = view(planStore.plans, (s) =>
    s.type === 'loaded' ? s.plans : [],
  );

  const noPlan$ = view(planStore.currentPlan, (p) => p === undefined);

  return (
    <header class={constant('app-header')}>
      <div class={constant('title-bar')}>
        <h1 class={constant('bp6-heading')}>
          {constant('ライフプランシミュレーター')}
        </h1>
        <div class={constant('account')}>
          <ThemeControl />
          <span class={constant('bp6-text-muted')}>{userName}</span>
          <Button
            icon={'log-out'}
            size={'small'}
            variant={constant('outlined')}
            data-e2e={constant('sign-out')}
            disabled={view(sessionStore.signOutState, (s) => s !== 'idle')}
            title={mapBindable(
              userName,
              (name) => `${name} としてサインイン中`,
            )}
            text={view(sessionStore.signOutState, (s) =>
              s === 'waiting' ? 'サインアウト中…' : 'サインアウト',
            )}
            onClick={sessionStore.signOut}
          />
        </div>
      </div>
      <Card class={'plan-bar'}>
        <Label class={'field'} text={constant('プラン')}>
          <HtmlSelect
            data-e2e={constant('plan-select')}
            disabled={noPlan$}
            value={view(planStore.currentPlan, (p) => p?.id ?? '')}
            onChange={(e) => {
              planStore.selectPlan(e.currentTarget.value);

              setConfirmingDelete(false);
            }}
          >
            <For items={plans$} key={(plan) => plan.id}>
              {(plan$) => (
                <option value={view(plan$, (p) => p.id)}>
                  {view(plan$, (p) => p.name)}
                </option>
              )}
            </For>
          </HtmlSelect>
        </Label>
        <Label class={'field'} text={constant('プラン名')}>
          <InputGroup
            data-e2e={constant('plan-name')}
            disabled={noPlan$}
            value={view(planStore.currentPlan, (p) => p?.name ?? '')}
            onChange={(e) => {
              planStore.renamePlan(e.currentTarget.value);
            }}
          />
        </Label>
        <div class={constant('actions')}>
          <Button
            icon={'plus'}
            intent={'primary'}
            data-e2e={constant('plan-create')}
            text={constant('新しいプラン')}
            onClick={() => {
              planStore.createPlan();

              setConfirmingDelete(false);
            }}
          />
          <Button
            icon={'duplicate'}
            data-e2e={constant('plan-duplicate')}
            disabled={noPlan$}
            text={constant('複製')}
            onClick={() => {
              planStore.duplicatePlan();

              setConfirmingDelete(false);
            }}
          />
          <If
            cond={confirmingDelete$}
            then={
              <span class={constant('actions')}>
                {view(
                  planStore.currentPlan,
                  (p) => `「${p?.name ?? ''}」を削除しますか？`,
                )}
                <Button
                  icon={'trash'}
                  intent={'danger'}
                  data-e2e={constant('plan-delete-confirm')}
                  text={constant('削除する')}
                  onClick={() => {
                    planStore.deletePlan();

                    setConfirmingDelete(false);
                  }}
                />
                <Button
                  text={constant('やめる')}
                  onClick={() => {
                    setConfirmingDelete(false);
                  }}
                />
              </span>
            }
            else={
              <Button
                icon={'trash'}
                intent={'danger'}
                variant={constant('outlined')}
                data-e2e={constant('plan-delete')}
                disabled={noPlan$}
                text={constant('削除')}
                onClick={() => {
                  setConfirmingDelete(true);
                }}
              />
            }
          />
        </div>
      </Card>
    </header>
  );
};
