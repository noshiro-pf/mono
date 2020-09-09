import React, { memo } from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import { Snackbar } from '@material-ui/core'

import { MyAppBar } from './components/my-app-bar'
import { routes } from './constants/route'
import { Home } from './components/home'
import { SelectMyName } from './components/dominion/select-my-name/select-my-name'
import { Randomizer } from './components/dominion/randomizer/randomizer'
import { GameResults } from './components/dominion/game-results/game-results'
import { CardList } from './components/dominion/cardlist/cardlist'
import { NotFound } from './components/not-found'
import { Rulebooks } from './components/dominion/rulebooks/rulebooks'
import { AdminDatabase } from './components/admin/admin-database'

const theme = createMuiTheme({
  typography: {
    // useNextVariants: true
  },
  props: {
    // Name of the component ⚛️
    MuiButtonBase: {
      // The properties to apply
      disableRipple: true // No more ripple, on the whole application
    }
  }
})

export const AppView = memo(
  ({
    myName,
    snackbarOpen
  }: Readonly<{
    myName: string
    snackbarOpen: boolean
  }>) => (
    <MuiThemeProvider theme={theme}>
      <BrowserRouter>
        <div>
          <MyAppBar />
          <Switch>
            <Route exact path={routes.home} component={Home} />
            <Route path={routes.selectMyName} component={SelectMyName} />
            <Route path={routes.dominion.randomizer} component={Randomizer} />
            <Route path={routes.dominion.gameResult} component={GameResults} />
            <Route path={routes.dominion.cardList} component={CardList} />
            <Route path={routes.dominion.rulebooks} component={Rulebooks} />
            <Route path={routes.adminDatabase} component={AdminDatabase} />
            <Route path='*' component={NotFound} />
          </Switch>

          <Snackbar
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            open={!!myName && snackbarOpen}
            ContentProps={{
              'aria-describedby': 'message-id'
            }}
            message={<span id='message-id'>Signed in as {myName}.</span>}
          />
        </div>
      </BrowserRouter>
    </MuiThemeProvider>
  )
)

AppView.displayName = 'AppView'
