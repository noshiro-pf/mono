import { Card } from 'blueprint-synstate';
import { constant, view, type JSX } from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import type { LivingCostItem } from '../../domain/index.mjs';
import { input$, updateSection } from '../../store/index.mjs';
import { formatYen } from '../../utils/index.mjs';
import { OutputField } from '../fields/index.mjs';
import { EditableTable, type EditableColumn } from '../tables/index.mjs';

/** `日常生活費` シート: 費目ごとの月額と合計。 */
export const LivingCostTab = (): JSX.Element => (
  <div class={constant('tab-body')}>
    <Card>
      <h2 class={constant('bp6-heading')}>{constant('日常生活費')}</h2>
      <p class={constant('bp6-text-muted note')}>
        {constant(
          '開始時点の月額。収支では物価上昇率で毎年増える。年額のものは 12 で割って入れる。',
        )}
      </p>
      <EditableTable
        caption="日常生活費"
        e2e="living-costs"
        items={view(input$, (i) => i.livingCosts)}
        columns={columns}
        update={(fn) => {
          updateSection('livingCosts', fn);
        }}
        createItem={(id) => ({
          id,
          category: '',
          name: '',
          monthly: 0,
          note: '',
        })}
      />
      <div class={constant('form')}>
        <OutputField
          label="合計（月額）"
          e2e="living-cost-total"
          value={view(input$, (i) =>
            formatYen(Arr.sum(i.livingCosts.map((c) => c.monthly))),
          )}
        />
      </div>
    </Card>
  </div>
);

const columns: readonly EditableColumn<LivingCostItem>[] = [
  {
    kind: 'text',
    header: '分類',
    get: (r) => r.category,
    set: (r, category) => ({ ...r, category }),
  },
  {
    kind: 'text',
    header: '項目',
    get: (r) => r.name,
    set: (r, name) => ({ ...r, name }),
  },
  {
    kind: 'number',
    header: '月額（円）',
    get: (r) => r.monthly,
    set: (r, monthly) => ({ ...r, monthly }),
  },
  {
    kind: 'text',
    header: '備考',
    get: (r) => r.note,
    set: (r, note) => ({ ...r, note }),
  },
] as const;
