import { Paper } from '@material-ui/core';
import { MuiTabs } from '@noshiro/react-material-ui-utils';
import { ComponentSwitcher, memoNamed } from '@noshiro/react-utils';
import { useState } from 'react';
import styled from 'styled-components';
import { LuminanceVisualizer, TextColorContrastTable } from './components';

const labels = ['luminance', 'text-color'];

export const App = memoNamed('App', () => {
  const [tabIndex, setTabIndex] = useState(0);
  return (
    <Root>
      <H1>{'Color demo'}</H1>
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
    </Root>
  );
});

const Root = styled.div`
  min-height: 100vh;
  background-color: hsl(0, 0%, 33%);
  padding: 10px;
  overflow: auto;
`;

const H1 = styled.h1`
  color: white;
`;
