import { Paper } from '@mui/material';
import { MuiTabs } from '@noshiro/react-mui-utils';
import { ComponentSwitcher } from '@noshiro/react-utils';
import { LuminanceVisualizer, TextColorContrastTable } from './components';

const labels = ['luminance', 'text-color'];

export const App = memoNamed('App', () => {
  const { state: tabIndex, setState: setTabIndex } = useState(0);
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
        data-cy={'title'}
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
