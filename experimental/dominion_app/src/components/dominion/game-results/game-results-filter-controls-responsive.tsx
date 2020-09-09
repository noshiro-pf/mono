import React, { memo, useCallback } from 'react'
import * as I from 'immutable'
import styled from 'styled-components'
import {
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  FormLabel
} from '@material-ui/core'

import { Centering } from '~/utils/components/centering'
import { MyInput } from '~/utils/components/native-input'

const Root = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`

const DateRangeWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: baseline;
  padding: 10px;
`

const ButtonsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: baseline;
  padding: 10px;
`

const CheckboxesWrapper = styled.div`
  padding: 10px;
`

const Tilde = styled.div`
  padding: 0 10px;
`

const ButtonWrapper = styled.div`
  padding: 10px;
`

const FormLabelWrapper = styled(Centering)`
  padding: 10px;
`

export const GameResultFilterControlsView = memo(
  ({
    dateBeginStr,
    dateBeginChange: dateBeginChangeInput,
    dateEndStr,
    dateEndChange: dateEndChangeInput,
    latestClick,
    resetAllClick,
    numPlayersOptions,
    onCheck: onCheckInput
  }: Readonly<{
    dateBeginStr: string
    dateBeginChange: (v: string) => void
    dateEndStr: string
    dateEndChange: (v: string) => void
    latestClick: () => void
    resetAllClick: () => void
    numPlayersOptions: I.List<{ numPlayers: number; checked: boolean }>
    onCheck: (i: number, checked: boolean) => void
  }>) => {
    const onCheck = useCallback(
      (i: number) => (_ev: any, checked: boolean) => {
        onCheckInput(i, checked)
      },
      [onCheckInput]
    )

    return (
      <Root>
        <DateRangeWrapper>
          <MyInput
            value={dateBeginStr}
            valueChange={dateBeginChangeInput}
            type='date'
            label='日付'
          />
          <Tilde>～</Tilde>
          <MyInput
            value={dateEndStr}
            valueChange={dateEndChangeInput}
            type='date'
            label='日付'
          />
        </DateRangeWrapper>

        <ButtonsWrapper>
          <ButtonWrapper>
            <Button variant='contained' color='primary' onClick={latestClick}>
              最新の結果
            </Button>
          </ButtonWrapper>
          <ButtonWrapper>
            <Button variant='contained' color='default' onClick={resetAllClick}>
              リセット
            </Button>
          </ButtonWrapper>
        </ButtonsWrapper>

        <CheckboxesWrapper>
          <FormGroup row>
            <FormLabelWrapper>
              <FormLabel>プレイヤー数：</FormLabel>
            </FormLabelWrapper>
            {numPlayersOptions.map(option => (
              <FormControlLabel
                key={option.numPlayers}
                control={
                  <Checkbox
                    checked={option.checked}
                    onChange={onCheck(option.numPlayers)}
                    value={option.numPlayers.toString()}
                  />
                }
                label={option.numPlayers}
              />
            ))}
          </FormGroup>
        </CheckboxesWrapper>
      </Root>
    )
  }
)

GameResultFilterControlsView.displayName = 'GameResultFilterControlsView'
