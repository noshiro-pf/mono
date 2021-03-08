import { Tab, Tabs } from '@material-ui/core';
import { memoNamed } from '@noshiro/react-utils';
import { Mappable } from '@noshiro/ts-utils';
import { useCallback } from 'react';

type Props = Readonly<{
  tabIndex: number;
  tabIndexChange: (v: number) => void;
  labels: Mappable<string>;
  scrollable?: boolean;
}>;

export const MuiTabs = memoNamed<Props>(
  'MyTabs',
  ({ tabIndex, tabIndexChange, labels, scrollable = false }) => {
    const onChange = useCallback(
      (_event: unknown, value: string) => {
        tabIndexChange(parseInt(value, 10));
      },
      [tabIndexChange]
    );

    return (
      <Tabs
        value={tabIndex}
        onChange={onChange}
        indicatorColor='primary'
        textColor='primary'
        variant={scrollable ? 'scrollable' : 'fullWidth'}
        scrollButtons={scrollable ? 'off' : undefined}
      >
        {labels.map((label) => (
          <Tab key={label} label={label} />
        ))}
      </Tabs>
    );
  }
);
