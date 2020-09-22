import React, { memo, CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'

import HomeIcon from '@material-ui/icons/Home'
import Button from '@material-ui/core/Button'
import PersonIcon from '@material-ui/icons/Person'

import { routes } from '~/constants/route'
import { Spacer } from '~/utils/components/spacer'

const Root = styled.div`
  flex-grow: 1;
`

const UserName = styled.div`
  color: white;
  margin: 0 10px;
`

const iconsStyle: CSSProperties = {
  color: 'white'
}

const toolbarStyle: CSSProperties = {
  backgroundColor: 'rgba(34,49,52,0.6)'
}

export const MyAppBarView = memo(({ myName }: Readonly<{ myName: string }>) => (
  <Root>
    <AppBar position='static'>
      <Toolbar style={toolbarStyle}>
        <Link to={routes.home}>
          <IconButton color='inherit' aria-label='Menu'>
            <HomeIcon style={iconsStyle} />
          </IconButton>
        </Link>

        <Spacer />

        <Link to={routes.selectMyName}>
          <Button color='inherit' aria-label='Menu'>
            <UserName>{myName}</UserName>
            <PersonIcon style={iconsStyle} />
          </Button>
        </Link>
      </Toolbar>
    </AppBar>
  </Root>
))

MyAppBarView.displayName = 'MyAppBarView'
