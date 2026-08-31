import { InputGroup, NumericInput } from '@blueprintjs/core';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { memoNamed } from 'react-utils';

/**
 * The inputs below are controlled, so React wants an `onChange`; the page has
 * nowhere to put the value. `react-blueprintjs-utils` exports a `noop`, but
 * depending on that package for one line would be the only reason this
 * playground needed it at all.
 */
const noop = (): undefined => undefined;

export const App = memoNamed('App', () => (
  <div
    css={css`
      min-height: 100vh;
      padding: 20px;
    `}
    data-e2e={'root'}
  >
    <h1>{'Blueprint.js Playground'}</h1>

    <h2>{'NumericInput'}</h2>
    <MarginBox>
      <NumericInput disabled={false} fill value={0} />
    </MarginBox>
    <MarginBox>
      <NumericInput disabled fill value={0} />
    </MarginBox>

    <h2>{'InputGroup'}</h2>
    <MarginBox>
      <InputGroup value={'aaa'} onChange={noop} />
    </MarginBox>
    <MarginBox>
      <InputGroup disabled value={'aaa'} onChange={noop} />
    </MarginBox>
    <MarginBox>
      <InputGroup
        placeholder={'placeholder'}
        value={undefined}
        onChange={noop}
      />
    </MarginBox>
  </div>
));

const MarginBox = styled.div`
  margin: 10px;

  & > * {
    margin: 10px;
  }
`;
