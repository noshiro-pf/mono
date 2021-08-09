import { useResizeObserver } from '@noshiro/preact-resize-observer-hooks';
import { memoNamed } from '@noshiro/preact-utils';
import type { JSXInternal } from 'preact/src/jsx';
import { GameMain } from './game-main';

export const Root = memoNamed('Root', () => {
  const [windowSize, ref] = useResizeObserver<HTMLDivElement>({
    width: 1280,
    height: 720,
    top: 0,
    left: 0,
  });

  return (
    <div ref={ref} style={rootStyle}>
      <GameMain windowSize={windowSize} />
    </div>
  );
});

const rootStyle: JSXInternal.CSSProperties = {
  width: '100vw',
  height: '100vh',
} as const;
