import { css } from '@emotion/react';
import { Paper } from '@mui/material';
import { useState } from 'better-react-use-state';
import { MuiTabs } from 'react-mui-utils';
import { ComponentSwitcher, memoNamed } from 'react-utils';
import {
  LuminanceVisualizer,
  TextColorContrastTable,
} from './components/index.mjs';

const labels = ['luminance', 'text-color'] as const;

export const App = memoNamed('App', () => {
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <div
      css={css`
        min-height: 100vh;
        background-color: hsl(0, 0%, 33%);
        padding: 10px;
        overflow: auto;
      `}
    >
      <h1
        css={css`
          color: white;
        `}
        data-e2e={'title'}
      >
        {'Color demo'}
      </h1>
      <Paper>
        <MuiTabs
          labels={labels}
          tabIndex={tabIndex}
          tabIndexChange={setTabIndex}
        />
        <ComponentSwitcher index={tabIndex}>
          <LuminanceVisualizer />
          <TextColorContrastTable />
        </ComponentSwitcher>
      </Paper>
    </div>
  );
});
