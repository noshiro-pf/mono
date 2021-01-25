import { Tab, Tabs } from '@material-ui/core'
import React, { memo, useCallback } from 'react'
import { useValueWithDefault } from '../hooks/use-prop-with-default'

export const MyTabs = memo(
  ({
    tabIndex,
    tabIndexChange,
    labels,
    scrollable: scrollableInput,
  }: Readonly<{
    tabIndex: number
    tabIndexChange: (v: number) => void
    labels: string[]
    scrollable?: boolean
  }>) => {
    const onChange = useCallback(
      (_event: any, value: string) => {
        tabIndexChange(parseInt(value, 10))
      },
      [tabIndexChange]
    )

    const scrollable = useValueWithDefault(scrollableInput, false)

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
    )
  }
)

MyTabs.displayName = 'MyTabs'
