import { useResizeObserver } from '@noshiro/preact-resize-observer-hooks';
import type { FunctionalComponent } from 'preact';
import type { JSXInternal } from 'preact/src/jsx';
import { GameMain } from '../game-main';

export const Root: FunctionalComponent = () => {
  const [windowSize, ref] = useResizeObserver({
    width: 1280,
    height: 720,
    top: 0,
    left: 0,
  });

  return (
    <div style={rootStyle} ref={ref}>
      <GameMain windowSize={windowSize} />
    </div>
  );
};

const rootStyle: JSXInternal.CSSProperties = {
  width: '100vw',
  height: '100vh',
} as const;
