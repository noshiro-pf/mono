import React, { memo } from 'react'
import * as I from 'immutable'
import {
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography
} from '@material-ui/core'

import { main } from '~/constants/default-styles'
import { TRulebook } from '~/types/rulebook'

const css = {
  box: {
    margin: '30px'
  },
  card: {
    width: '250px'
  },
  wrapper: {
    display: 'flex',
    flexFlow: 'row wrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    alignContent: 'flex-start'
  }
}

export const RulebooksView = memo(
  ({
    rulebooks
  }: Readonly<{
    rulebooks: I.List<TRulebook>
  }>) => (
    <div style={main}>
      <h2>Rulebooks</h2>
      <div style={css.wrapper}>
        {rulebooks
          .filter(rb => !!rb.imgurl)
          .map(rb => (
            <div key={rb.title} style={css.box}>
              <Card style={css.card}>
                <CardActionArea>
                  <a href={rb.pdfurl} target='_blank' rel='noopener noreferrer'>
                    <CardMedia
                      component='img'
                      image={rb.imgurl}
                      title={rb.title}
                    />
                    <CardContent>
                      <Typography component='p'>{rb.title}</Typography>
                    </CardContent>
                  </a>
                </CardActionArea>
              </Card>
            </div>
          ))}
      </div>
    </div>
  )
)

RulebooksView.displayName = 'RulebooksView'
