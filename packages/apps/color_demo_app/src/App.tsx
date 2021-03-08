import { Paper } from '@material-ui/core';
import { MuiTabs } from '@noshiro/react-material-ui-utils';
import { ComponentSwitcher } from '@noshiro/react-utils';
import { FC, useState } from 'react';
import styled from 'styled-components';
import { LuminanceVisualizer } from './components/pages/luminance-visualizer/luminance-visualizer';
import { TextColorContrastTable } from './components/pages/text-color-contrast-table';

const Root = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: hsl(0, 0%, 33%);
  padding: 10px;
  overflow: auto;
`;

const H1 = styled.h1`
  color: white;
`;

const labels = ['luminance', 'text-color'];

export const App: FC = () => {
  const [tabIndex, setTabIndex] = useState(0);
  return (
    <Root>
      <H1>Color demo</H1>
      <Paper>
        <MuiTabs
          tabIndex={tabIndex}
          tabIndexChange={setTabIndex}
          labels={labels}
        />
        <ComponentSwitcher index={tabIndex}>
          <LuminanceVisualizer />
          <TextColorContrastTable />
        </ComponentSwitcher>
      </Paper>
    </Root>
  );
};
