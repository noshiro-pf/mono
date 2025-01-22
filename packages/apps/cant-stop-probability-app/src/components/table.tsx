import { HTMLTable } from '@blueprintjs/core';
import { BpButton, BpInput } from '@noshiro/react-blueprintjs-utils';
import { denom, separator } from '../constants';
import { toPercentString } from '../functions';
import { type ResultRow } from '../types';

type Props = Readonly<{
  sortByDice: () => void;
  sortByProbability: () => void;
  filterByString: string;
  onFilterByStringChange: (value: string) => void;
  filtered: readonly ResultRow[];
}>;

export const ProbabilityTable = memoNamed<Props>(
  'ProbabilityTable',
  ({
    sortByDice,
    sortByProbability,
    filterByString,
    onFilterByStringChange,
    filtered,
  }) => (
    <HTMLTable bordered={true} striped={true}>
      <thead>
        <tr>
          <Th colSpan={3}>
            <NoWrapBox>
              <span>{'選択した列の数字'}</span>
              <BpButton icon={'sort'} minimal={true} onClick={sortByDice} />
            </NoWrapBox>
          </Th>
          <Th>
            <NoWrapBox>
              <span>{'少なくとも1列当たる確率'}</span>
              <BpButton
                icon={'sort'}
                minimal={true}
                onClick={sortByProbability}
              />
            </NoWrapBox>
          </Th>
          <Th colSpan={3}>{'ちょうどその段数進められる組合せ数'}</Th>
          <Th
            title={[
              'P0 := 〈出た目がどの列にもマッチせずこのターン進めた分が帳消しになる確率〉',
              'P1 := 〈出た目でちょうど1列進められる確率〉',
              'P2 := 〈出た目でちょうど2列進められる確率〉',
              'として',
              '-N * P0 + 1 * P1 + 2 * P2 > 0',
              'を満たす最大の整数Nで計算している。',
            ].join('\n')}
          >
            {'このターンに選んだ3列について、既に合計N段進んでいるときに'}
            <br />
            {'あと1回サイコロを振る期待値がプラスになる最大のN'}
          </Th>
        </tr>
        <tr>
          <Th colSpan={3}>
            <BpInput
              data-e2e={'filter-input'}
              leftIcon={'filter-list'}
              placeholder={`"${separator}" 区切りで数字を入力`}
              value={filterByString}
              onValueChange={onFilterByStringChange}
            />
          </Th>
          <Th />
          <Th colSpan={3} />
          <Th />
        </tr>
        <tr>
          <Td>{'a'}</Td>
          <Th>{'b'}</Th>
          <Th>{'c'}</Th>
          <Th />
          <Th
            title={
              '「(1,1,6,6)で7の列を2段」や「(1,2,6,6)で7と8の列を1段ずつ」のようなケース'
            }
          >
            {'2段'}
          </Th>
          <Th>{'1段'}</Th>
          <Th>{'0段'}</Th>
          <Th />
        </tr>
      </thead>
      <tbody data-e2e={'table-body'}>
        {filtered.map((r) => (
          <tr key={r.id}>
            <Td>{r.selected[0]}</Td>
            <Td>{r.selected[1]}</Td>
            <Td>{r.selected[2]}</Td>
            <Td>
              <b>{toPercentString(r.probability)}</b>
              {`  (${r.countSum}/${denom})`}
            </Td>
            <Td>{r.count.twoLine}</Td>
            <Td>{r.count.oneLine}</Td>
            <Td>{r.count.noLine}</Td>
            <Td>{r.expected}</Td>
          </tr>
        ))}
      </tbody>
    </HTMLTable>
  ),
);

const Th = styled.th`
  text-align: center !important;
`;
const Td = styled.td`
  text-align: center !important;
`;

const NoWrapBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
`;
