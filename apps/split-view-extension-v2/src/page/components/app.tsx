import { constant, type JSX } from 'synstate-dom';
import { createController } from '../controller.mjs';
import { Stage } from './stage.js';
import { TopBar } from './top-bar.js';

/** `split.html`: the top bar over the stage. */
export const App = (): JSX.Element => {
  const controller = createController();

  return (
    <div class={constant('app')}>
      <TopBar controller={controller} />
      <Stage
        dispatch={controller.dispatch}
        resetOrigins$={controller.resetOrigins$}
        session$={controller.session$}
        onNavigate={controller.navigate}
        onShortcut={controller.shortcut}
        onToggleResetOrigin={controller.toggleResetOrigin}
      />
    </div>
  );
};
