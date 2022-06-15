import { memo } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

const Root = styled.div`
  margin: 20px;
`

export const NotFound = memo(() => (
  <Root>
    <h2>Page not found</h2>
    <Link to='/'>Return to Home Page</Link>
  </Root>
))

NotFound.displayName = 'NotFound'
