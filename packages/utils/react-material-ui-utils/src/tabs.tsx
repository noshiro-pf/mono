import { Tab, Tabs } from '@material-ui/core';
import { memoNamed } from '@noshiro/react-utils';
import { useCallback } from 'react';

export const MuiTabs = memoNamed<
  Readonly<{
    tabIndex: number;
    tabIndexChange: (v: number) => void;
    labels: string[];
  }>
>('MyTabs', ({ tabIndex, tabIndexChange, labels }) => {
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
    >
      {labels.map((label) => (
        <Tab key={label} label={label} />
      ))}
    </Tabs>
  );
});
