import { Button, Checkbox, FormControlLabel } from '@material-ui/core'
import * as I from 'immutable'
import { CSSProperties, memo, useCallback } from 'react'

const buttonStyle: CSSProperties = {
  margin: '5px',
}

export const ExpansionsToggleListView = memo(
  ({
    expansionsWithCheck,
    checkOnChange: checkOnChangeInput,
    selectAllClick,
    deselectAllClick,
  }: Readonly<{
    expansionsWithCheck: I.List<[string, boolean]>
    checkOnChange: (v: { name: string; checked: boolean }) => void
    selectAllClick: () => void
    deselectAllClick: () => void
  }>) => {
    const checkOnChange = useCallback(
      (name: string) => (_: any, checked: boolean) => {
        checkOnChangeInput({ name, checked })
      },
      [checkOnChangeInput],
    )

    const selectionState: 'all' | 'partial' | 'none' = (() => {
      const numChecked = expansionsWithCheck.filter(([_, check]) => check).size
      if (numChecked === expansionsWithCheck.size) {
        return 'all'
      } else if (numChecked === 0) {
        return 'none'
      } else {
        return 'partial'
      }
    })()

    return (
      <>
        <div>
          {selectionState !== 'all' && (
            <Button
              variant='outlined'
              color='primary'
              onClick={selectAllClick}
              style={buttonStyle}
            >
              全選択
            </Button>
          )}
          {selectionState !== 'none' && (
            <Button
              variant='outlined'
              color='default'
              onClick={deselectAllClick}
              style={buttonStyle}
            >
              全解除
            </Button>
          )}
        </div>
        <div>
          {expansionsWithCheck.map(([name, checked]) => (
            <FormControlLabel
              key={name}
              control={
                <Checkbox
                  checked={checked}
                  onChange={checkOnChange(name)}
                  color='primary'
                />
              }
              label={name}
            />
          ))}
        </div>
      </>
    )
  },
)

ExpansionsToggleListView.displayName = 'ExpansionsToggleListView'
