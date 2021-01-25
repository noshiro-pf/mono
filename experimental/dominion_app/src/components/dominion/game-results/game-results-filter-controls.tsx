import * as I from 'immutable'
import React, { memo, useCallback, useMemo } from 'react'
import * as date from 'typescript-utils/functions/date'
import { GameResultFilterControlsView } from './game-results-filter-controls-responsive'

export const GameResultFilterControls = memo(
  ({
    dateBegin,
    dateBeginChange,
    dateEnd,
    dateEndChange,
    latestClick,
    resetAllClick,
    numPlayersOptions,
    numPlayerCheck,
  }: Readonly<{
    dateBegin: number
    dateBeginChange: (v: number) => void
    dateEnd: number
    dateEndChange: (v: number) => void
    latestClick: () => void
    resetAllClick: () => void
    numPlayersOptions: I.List<{ numPlayers: number; checked: boolean }>
    numPlayerCheck: (v: { numPlayers: number; checked: boolean }) => void
  }>) => {
    const dateBeginStr = useMemo(() => date.toYMD(dateBegin, '-'), [dateBegin])

    const _dateBeginChange = useCallback(
      (v: string) => dateBeginChange(new Date(v).getTime()),
      [dateBeginChange]
    )

    const dateEndStr = useMemo(() => date.toYMD(dateEnd, '-'), [dateEnd])

    const _dateEndChange = useCallback(
      (v: string) => dateEndChange(new Date(v).getTime()),
      [dateEndChange]
    )

    const onCheck = useCallback(
      (i: number, checked: boolean) => {
        numPlayerCheck({ numPlayers: i, checked: checked })
      },
      [numPlayerCheck]
    )

    return (
      <GameResultFilterControlsView
        dateBeginStr={dateBeginStr}
        dateBeginChange={_dateBeginChange}
        dateEndStr={dateEndStr}
        dateEndChange={_dateEndChange}
        latestClick={latestClick}
        resetAllClick={resetAllClick}
        numPlayersOptions={numPlayersOptions}
        onCheck={onCheck}
      />
    )
  }
)

GameResultFilterControls.displayName = 'GameResultFilterControls'
