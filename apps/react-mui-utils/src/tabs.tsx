import { Tab, Tabs } from '@mui/material';
import * as React from 'react';
import { memoNamed } from 'react-utils';
import { Num, Result } from 'ts-data-forge';

type Props = Readonly<{
  tabIndex: number;
  tabIndexChange: (v: number) => void;
  labels: readonly string[];
  scrollable?: boolean;
}>;

export const MuiTabs = memoNamed<Props>(
  'MyTabs',
  ({ tabIndex, tabIndexChange, labels, scrollable = false }) => {
    const onChange = React.useCallback(
      (_event: unknown, value: string) => {
        const idx = Result.unwrapOkOr(Num.safeParseInt(value), Number.NaN);

        if (!Number.isNaN(idx)) {
          tabIndexChange(idx);
        }
      },
      [tabIndexChange],
    );

    return (
      <Tabs
        indicatorColor={'primary'}
        scrollButtons={scrollable}
        textColor={'primary'}
        value={tabIndex}
        variant={scrollable ? 'scrollable' : 'fullWidth'}
        onChange={onChange}
      >
        {labels.map((label) => (
          <Tab key={label} label={label} />
        ))}
      </Tabs>
    );
  },
);
