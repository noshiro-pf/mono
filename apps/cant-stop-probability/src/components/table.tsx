import { Button, HtmlTable, InputGroup } from 'blueprint-synstate';
import { map } from 'synstate';
import { constant, For, type JSX } from 'synstate-dom';
import { denom, separator } from '../constants/index.mjs';
import { toPercentString } from '../functions/index.mjs';
import {
  filterByString$,
  filtered$,
  setFilterByString,
  sortByDice,
  sortByProbability,
} from '../store.mjs';
import * as styles from './table.module.css';

/** Every choice of three columns, with its chances; sortable and filterable. */
export const ProbabilityTable = (): JSX.Element => (
  <HtmlTable bordered striped>
    <thead>
      <tr>
        <th class={cell} colSpan={constant(3)}>
          <div class={constant(styles.noWrapBox)}>
            <span>{constant('選択した列の数字')}</span>
            <Button
              aria-label={constant('選択した列の数字で並べ替え')}
              icon={'sort'}
              variant={constant('minimal')}
              onClick={sortByDice}
            />
          </div>
        </th>
        <th class={cell}>
          <div class={constant(styles.noWrapBox)}>
            <span>{constant('少なくとも1列当たる確率')}</span>
            <Button
              aria-label={constant('確率で並べ替え')}
              icon={'sort'}
              variant={constant('minimal')}
              onClick={sortByProbability}
            />
          </div>
        </th>
        <th class={cell} colSpan={constant(3)}>
          {constant('ちょうどその段数進められる組合せ数')}
        </th>
        <th class={cell} title={constant(expectedTitle)}>
          {constant(
            'このターンに選んだ3列について、既に合計N段進んでいるときに',
          )}
          <br />
          {constant('あと1回サイコロを振る期待値がプラスになる最大のN')}
        </th>
      </tr>
      <tr>
        <th class={cell} colSpan={constant(3)}>
          <InputGroup
            aria-label={constant('列の数字で絞り込む')}
            data-e2e={constant('filter-input')}
            leftIcon={'filter-list'}
            placeholder={constant(`"${separator}" 区切りで数字を入力`)}
            value={filterByString$}
            onInput={(event) => {
              setFilterByString(event.currentTarget.value);
            }}
          />
        </th>
        <th class={cell} />
        <th class={cell} colSpan={constant(3)} />
        <th class={cell} />
      </tr>
      <tr>
        <th class={cell}>{constant('a')}</th>
        <th class={cell}>{constant('b')}</th>
        <th class={cell}>{constant('c')}</th>
        <th class={cell} />
        <th class={cell} title={constant(twoStepsTitle)}>
          {constant('2段')}
        </th>
        <th class={cell}>{constant('1段')}</th>
        <th class={cell}>{constant('0段')}</th>
        <th class={cell} />
      </tr>
    </thead>
    <tbody data-e2e={constant('table-body')}>
      <For items={filtered$} key={(row) => row.id}>
        {(row$) => (
          <tr>
            <td class={cell}>{row$.pipe(map((r) => r.selected[0]))}</td>
            <td class={cell}>{row$.pipe(map((r) => r.selected[1]))}</td>
            <td class={cell}>{row$.pipe(map((r) => r.selected[2]))}</td>
            <td class={cell}>
              <b>{row$.pipe(map((r) => toPercentString(r.probability)))}</b>
              {row$.pipe(map((r) => `  (${r.countSum}/${denom})`))}
            </td>
            <td class={cell}>{row$.pipe(map((r) => r.count.twoLine))}</td>
            <td class={cell}>{row$.pipe(map((r) => r.count.oneLine))}</td>
            <td class={cell}>{row$.pipe(map((r) => r.count.noLine))}</td>
            <td class={cell}>{row$.pipe(map((r) => r.expected))}</td>
          </tr>
        )}
      </For>
    </tbody>
  </HtmlTable>
);

const cell = constant(styles.cell);

const expectedTitle = [
  'P0 := 〈出た目がどの列にもマッチせずこのターン進めた分が帳消しになる確率〉',
  'P1 := 〈出た目でちょうど1列進められる確率〉',
  'P2 := 〈出た目でちょうど2列進められる確率〉',
  'として',
  '-N * P0 + 1 * P1 + 2 * P2 > 0',
  'を満たす最大の整数Nで計算している。',
].join('\n');

const twoStepsTitle =
  '「(1,1,6,6)で7の列を2段」や「(1,2,6,6)で7と8の列を1段ずつ」のようなケース';
