import React, { memo, useMemo } from 'react'
import * as dateUtils from 'typescript-utils/functions/date'
import { MyInput } from '~/utils/components/native-input'

const noop = () => 0

export const GamePlayedDate = memo(
  ({
    editMode,
    date,
    dateChange,
  }: Readonly<{
    editMode: boolean
    date: string
    dateChange: (value: string) => void
  }>) => {
    const dateValue = useMemo(
      () => `${dateUtils.toYMD(date, '-')}T${dateUtils.toHM(date)}`,
      [date]
    )

    return (
      <div>
        <MyInput
          value={dateValue}
          valueChange={editMode ? dateChange : noop}
          type='datetime-local'
          label='日時'
          disabled={!editMode}
        />
      </div>
    )
  }
)

GamePlayedDate.displayName = 'GamePlayedDate'
