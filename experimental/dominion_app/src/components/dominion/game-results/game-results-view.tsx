import React, { useState, memo } from 'react'
import * as I from 'immutable'
import styled from 'styled-components'
import { Divider, Paper } from '@material-ui/core'

import { TGameResult } from '~/types/game-result'
import { GameResultFilterControls } from './game-results-filter-controls'
import { ScoreTable } from './score-table/score-table'
import { GameResultList } from './game-result-list/game-result-list'
import { GameResultOfPlayer } from './game-result-of-player/game-result-of-player'
import { ComponentSwitcher } from '~/utils/components/component-switcher'
import { MyTabs } from '~/utils/components/tabs'

const Root = styled.div`
  padding: 20px;
`

const Content = styled.div`
  padding: 20px;
`

export const GameResultsView = memo(
  ({
    gameResultsFiltered,
    dateBegin,
    dateBeginChange,
    dateEnd,
    dateEndChange,
    latestClick,
    resetAllClick,
    numPlayersOptions,
    numPlayerCheck
  }: Readonly<{
    gameResultsFiltered: I.List<TGameResult>
    dateBegin: number
    dateBeginChange: (v: number) => void
    dateEnd: number
    dateEndChange: (v: number) => void
    latestClick: () => void
    resetAllClick: () => void
    numPlayersOptions: I.List<{ numPlayers: number; checked: boolean }>
    numPlayerCheck: (v: { numPlayers: number; checked: boolean }) => void
  }>) => {
    const [tabIndex, setTabIndex] = useState<number>(0)

    return (
      <Root>
        <GameResultFilterControls
          dateBegin={dateBegin}
          dateBeginChange={dateBeginChange}
          dateEnd={dateEnd}
          dateEndChange={dateEndChange}
          latestClick={latestClick}
          resetAllClick={resetAllClick}
          numPlayersOptions={numPlayersOptions}
          numPlayerCheck={numPlayerCheck}
        />

        <Paper>
          <Content>
            <MyTabs
              tabIndex={tabIndex}
              tabIndexChange={setTabIndex}
              labels={['ゲーム記録リスト', '個人成績', 'スコア定義']}
            />

            <Divider />

            <ComponentSwitcher index={tabIndex}>
              <GameResultList gameResultsFiltered={gameResultsFiltered} />
              <GameResultOfPlayer gameResultsFiltered={gameResultsFiltered} />
              <ScoreTable />
            </ComponentSwitcher>
          </Content>
        </Paper>
      </Root>
    )
  }
)

GameResultsView.displayName = 'GameResultsView'
