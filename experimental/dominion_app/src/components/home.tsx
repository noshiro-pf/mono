import React, { memo } from 'react'
import { Link } from 'react-router-dom'
import * as I from 'immutable'
import { Card, CardContent, Typography } from '@material-ui/core'

import { main } from '../constants/default-styles'

const apps: I.List<{
  route: string
  title: string
  subtitle: string
  description: string
}> = I.List([
  {
    route: '/randomizer',
    title: 'Randomizer',
    subtitle: 'サプライ生成＆ゲーム結果追加（グループ同期機能付き）',
    description: '※Chrome推奨'
  },
  {
    route: '/game-result',
    title: 'Game Result',
    subtitle: '成績表',
    description: ''
  },
  {
    route: '/card-list',
    title: 'Card List',
    subtitle: 'カード一覧表',
    description: ''
  },
  {
    route: '/rulebooks',
    title: 'Rulebooks',
    subtitle: 'Dominionのルールブック(PDF)',
    description: ''
  }
])

const css = {
  box: {
    margin: '20px'
  },
  card: {
    width: '100%'
  },
  wrapper: {
    display: 'flex',
    flexFlow: 'row wrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    alignContent: 'flex-start'
  }
}

export const Home = memo(() => (
  <div style={main}>
    {apps.map(app => (
      <div key={app.title} style={css.box}>
        <Card style={css.card}>
          <Link to={app.route}>
            <CardContent>
              <Typography variant='h5' component='h2'>
                {app.title}
              </Typography>
              <Typography component='p'>{app.subtitle}</Typography>
              <Typography component='p'>{app.description}</Typography>
            </CardContent>
          </Link>
        </Card>
      </div>
    ))}
  </div>
))

Home.displayName = 'Home'
