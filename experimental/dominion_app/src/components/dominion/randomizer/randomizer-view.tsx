import React, { memo, useMemo } from 'react'
import { Paper } from '@material-ui/core'

import { ComponentSwitcher } from '~/utils/components/component-switcher'
import { MyTabs } from '~/utils/components/tabs'

import { RandomizerSelectCards } from './randomizer-select-cards/randomizer-select-cards'
import { BlackMarketPile } from './black-market-pile/black-marked-pile'
import { AddGameResult } from './add-game-result/add-game-result'

export const RandomizerView = memo(
  ({
    signedIn,
    signedInToGroup,
    tabIndex,
    tabIndexOnChange: tabIndexOnChangeInput,
    BlackMarketIsUsed
  }: Readonly<{
    signedIn: boolean
    signedInToGroup: boolean
    tabIndex: number
    tabIndexOnChange: (i: number) => void
    BlackMarketIsUsed: boolean
  }>) => {
    const labels = useMemo(
      () =>
        BlackMarketIsUsed
          ? ['Randomizer', '結果入力', '闇市場デッキ']
          : ['Randomizer', '結果入力'],
      [BlackMarketIsUsed]
    )

    return (
      <>
        {!signedIn && <div>ログインしてください。</div>}
        {!signedInToGroup && <div>グループに参加してください。</div>}

        {signedIn && signedInToGroup && (
          <>
            <Paper square={true}>
              <MyTabs
                tabIndex={tabIndex}
                tabIndexChange={tabIndexOnChangeInput}
                scrollable={true}
                labels={labels}
              />
            </Paper>

            <ComponentSwitcher index={tabIndex}>
              <RandomizerSelectCards />
              <AddGameResult />
              {BlackMarketIsUsed && <BlackMarketPile />}
            </ComponentSwitcher>
          </>
        )}
      </>
    )
  }
)

RandomizerView.displayName = 'RandomizerView'
