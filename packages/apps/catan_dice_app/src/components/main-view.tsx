import {
  Avatar,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
} from '@material-ui/core';
import { memoNamed } from '@noshiro/react-utils';
import type { ReadonlyArrayOfLength } from '@noshiro/ts-utils';
import styled from 'styled-components';
import { DiceIcon, SumIcon } from '../assets';
import { DiceNumber } from './dicer-number';
import { Histogram } from './histogram';

type Props = Readonly<{
  diceValue1: number;
  diceValue2: number;
  sumCount: ReadonlyArrayOfLength<11, number>;
  opacity: number;
  rollDices: () => void;
  undo: () => void;
  redo: () => void;
  undoable: boolean;
  redoable: boolean;
}>;

export const MainView = memoNamed<Props>(
  'MainView',
  ({
    diceValue1,
    diceValue2,
    sumCount,
    opacity,
    rollDices,
    undo,
    redo,
    undoable,
    redoable,
  }) => (
    <Root>
      <PaddedPaper>
        <List>
          <ListItem>
            <ListItemAvatar>
              <Avatar alt='Dice 1' src={DiceIcon} />
            </ListItemAvatar>
            <ListItemText>
              <DiceNumber n={diceValue1} opacity={opacity} />
            </ListItemText>
          </ListItem>
          <ListItem>
            <ListItemAvatar>
              <Avatar alt='Dice 2' src={DiceIcon} />
            </ListItemAvatar>
            <ListItemText>
              <DiceNumber n={diceValue2} opacity={opacity} />
            </ListItemText>
          </ListItem>
          <ListItem>
            <ListItemAvatar>
              <Avatar alt='Sum' src={SumIcon} />
            </ListItemAvatar>
            <ListItemText>
              <DiceNumber n={diceValue1 + diceValue2} opacity={opacity} />
            </ListItemText>
          </ListItem>
        </List>
        <ButtonsWrapper>
          <ButtonWithMargin>
            <Button variant='contained' color='primary' onClick={rollDices}>
              {'Roll dices!!!'}
            </Button>
          </ButtonWithMargin>
          <ButtonWithMargin>
            <Button
              variant='contained'
              color='default'
              disabled={!undoable}
              onClick={undo}
            >
              {'Undo'}
            </Button>
          </ButtonWithMargin>
          <ButtonWithMargin>
            <Button
              variant='contained'
              color='default'
              disabled={!redoable}
              onClick={redo}
            >
              {'Redo'}
            </Button>
          </ButtonWithMargin>
        </ButtonsWrapper>
        <HistogramWrapper>
          <Histogram sumCount={sumCount} />
        </HistogramWrapper>
      </PaddedPaper>
    </Root>
  )
);

const Root = styled.div`
  padding: 20px;
  user-select: none;
  -webkit-touch-callout: none;
`;

const PaddedPaper = styled(Paper)`
  padding: 10px;
`;

const HistogramWrapper = styled.div`
  padding: 20px 10px;
  height: 350px;
  width: 350px;
  max-width: 100%;
`;

const ButtonsWrapper = styled.div`
  padding: 10px;
  display: flex;
  flex-direction: row;
`;

const ButtonWithMargin = styled.div`
  padding: 5px;
`;
