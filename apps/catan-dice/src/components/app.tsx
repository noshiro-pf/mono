import { constant, type JSX, view } from 'synstate-dom';
import { DiceIcon, SumIcon } from '../assets/index.mjs';
import {
  diceValues$,
  opacity$,
  redo,
  redoable$,
  rollDices,
  sumCount$,
  undo,
  undoable$,
} from '../store.mjs';
import * as styles from './app.module.css';
import { DiceNumber } from './dice-number.js';
import { Histogram } from './histogram.js';
import { ListItemWithAvatar } from './list-item-with-avatar.js';
import { MuiButton } from './mui-button.js';

export const App = (): JSX.Element => (
  <div class={constant(styles.root)}>
    <div class={constant(styles.paper)}>
      <ul class={constant(styles.list)}>
        <ListItemWithAvatar alt={'Dice 1'} src={DiceIcon}>
          <DiceNumber
            e2eId={'dice-1'}
            opacity={opacity$}
            value={view(diceValues$, ([dice1]) => dice1)}
          />
        </ListItemWithAvatar>
        <ListItemWithAvatar alt={'Dice 2'} src={DiceIcon}>
          <DiceNumber
            e2eId={'dice-2'}
            opacity={opacity$}
            value={view(diceValues$, ([, dice2]) => dice2)}
          />
        </ListItemWithAvatar>
        <ListItemWithAvatar alt={'Sum'} src={SumIcon}>
          <DiceNumber
            e2eId={'dice-sum'}
            opacity={opacity$}
            value={view(diceValues$, ([dice1, dice2]) => dice1 + dice2)}
          />
        </ListItemWithAvatar>
      </ul>
      <div class={constant(styles.buttons)}>
        <div class={constant(styles.buttonWrapper)}>
          <MuiButton
            color={'primary'}
            e2eId={'roll-dice-button'}
            label={'Roll dices!!!'}
            onClick={rollDices}
          />
        </div>
        <div class={constant(styles.buttonWrapper)}>
          <MuiButton
            color={'secondary'}
            disabled={view(undoable$, (undoable) => !undoable)}
            e2eId={'undo-button'}
            label={'Undo'}
            onClick={undo}
          />
        </div>
        <div class={constant(styles.buttonWrapper)}>
          <MuiButton
            color={'secondary'}
            disabled={view(redoable$, (redoable) => !redoable)}
            e2eId={'redo-button'}
            label={'Redo'}
            onClick={redo}
          />
        </div>
      </div>
      <div class={constant(styles.histogramArea)}>
        <Histogram sumCount={sumCount$} />
      </div>
    </div>
  </div>
);
