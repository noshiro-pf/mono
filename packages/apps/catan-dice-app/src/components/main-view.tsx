import {
  Avatar,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
} from '@mui/material';
import { DiceIcon, SumIcon } from '../assets';
import { DiceNumber } from './dicer-number';
import { Histogram } from './histogram';

type Props = Readonly<{
  diceValue1: number;
  diceValue2: number;
  sumCount: ArrayOfLength<11, number>;
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
    <div
      css={css`
        min-height: 100vh;
        padding: 20px;
        user-select: none;
        -webkit-touch-callout: none;
      `}
    >
      <Paper
        css={css`
          padding: 10px;
        `}
      >
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
        <div
          css={css`
            padding: 10px;
            display: flex;
            flex-direction: row;
          `}
        >
          <div css={buttonWithMarginStyle}>
            <Button color={'primary'} variant='contained' onClick={rollDices}>
              {'Roll dices!!!'}
            </Button>
          </div>
          <div css={buttonWithMarginStyle}>
            <Button
              color={'secondary'}
              disabled={!undoable}
              variant='contained'
              onClick={undo}
            >
              {'Undo'}
            </Button>
          </div>
          <div css={buttonWithMarginStyle}>
            <Button
              color={'secondary'}
              disabled={!redoable}
              variant='contained'
              onClick={redo}
            >
              {'Redo'}
            </Button>
          </div>
        </div>
        <div
          css={css`
            padding: 20px 10px;
            height: 350px;
            width: 350px;
            max-width: 100%;
          `}
        >
          <Histogram sumCount={sumCount} />
        </div>
      </Paper>
    </div>
  )
);

const buttonWithMarginStyle = css`
  padding: 5px;
`;
