import { Tab, Tabs } from '@material-ui/core';
import { memoNamed } from '@mono/react-utils';
import { Mappable } from '@mono/ts-utils';
import React, { useCallback } from 'react';
import { useValueWithDefault } from './hooks';

export const MyTabs = memoNamed<{
  tabIndex: number;
  tabIndexChange: (v: number) => void;
  labels: Mappable<string>;
  scrollable?: boolean;
}>(
  'MyTabs',
  ({ tabIndex, tabIndexChange, labels, scrollable: scrollableInput }) => {
    const onChange = useCallback(
      (_event: any, value: string) => {
        tabIndexChange(parseInt(value, 10));
      },
      [tabIndexChange]
    );

    const scrollable = useValueWithDefault(scrollableInput, false);

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
