import { HTMLTable } from '@blueprintjs/core';
import { BpButton } from '@noshiro/react-blueprintjs-utils';
import { memoNamed } from '@noshiro/react-utils';
import { FC, useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { denom } from './constants/denom';
import { selected3List } from './constants/selected-3-list';
import { countSuccess } from './functions/count-success';

const results = selected3List().map(([x, y, z]) => {
  const count = countSuccess(x, y, z);
  return {
    selected: [x, y, z],
    count: count,
    probability: count / denom,
  };
});

const resultsSortedByprobability = results
  .slice()
  .sort((a, b) => a.count - b.count)
  .reverse();

export const App: FC = memoNamed('App', () => {
  const [sortBy, setSortBy] = useState<1 | 2>(1);
  const onSortChange1 = useCallback(() => {
    setSortBy(1);
  }, []);
  const onSortChange2 = useCallback(() => {
    setSortBy(2);
  }, []);

  const sorted = useMemo(
    () => (sortBy === 1 ? results : resultsSortedByprobability),
    [sortBy]
  );

  return (
    <Wrapper>
      <HTMLTable striped={true} bordered={true}>
        <thead>
          <tr>
            <Th colSpan={3}>
              <span>選択した列の数字</span>
              <BpButton minimal={true} icon={'sort'} onClick={onSortChange1} />
            </Th>
            <Th>
              <span>その列の数字になる組み合わせが出る確率</span>
              <BpButton minimal={true} icon={'sort'} onClick={onSortChange2} />
            </Th>
            <Th>
              <span>組み合わせの数</span>
              <BpButton minimal={true} icon={'sort'} onClick={onSortChange2} />
            </Th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => (
            <tr key={i}>
              <Td>{r.selected[0]} </Td>
              <Td>{r.selected[1]} </Td>
              <Td>{r.selected[2]} </Td>
              <Td>{r.probability} </Td>
              <Td>
                {r.count}/{denom}
              </Td>
            </tr>
          ))}
        </tbody>
      </HTMLTable>
    </Wrapper>
  );
});

const Wrapper = styled.div`
  padding: 20px;
`;

const Th = styled.th`
  text-align: center !important;
`;
const Td = styled.td`
  text-align: center !important;
`;
