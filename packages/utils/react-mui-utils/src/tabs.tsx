import { Tab, Tabs } from '@mui/material';
import { memoNamed } from '@noshiro/react-utils';
import { Num } from '@noshiro/ts-utils';
import { useCallback } from 'react';

type Props = Readonly<{
  tabIndex: number;
  tabIndexChange: (v: number) => void;
  labels: readonly string[];
  scrollable?: boolean;
}>;

export const MuiTabs = memoNamed<Props>(
  'MyTabs',
  ({ tabIndex, tabIndexChange, labels, scrollable = false }) => {
    const onChange = useCallback(
      (_event: unknown, value: string) => {
        const idx = Num.parseInt(value, 10);
        if (idx !== undefined) {
          tabIndexChange(idx);
        }
      },
      [tabIndexChange]
    );

    return (
      <Tabs
        indicatorColor='primary'
        scrollButtons={scrollable}
        textColor='primary'
        value={tabIndex}
        variant={scrollable ? 'scrollable' : 'fullWidth'}
        onChange={onChange}
      >
        {labels.map((label) => (
          <Tab key={label} label={label} />
        ))}
      </Tabs>
    );
  }
);