import { useState } from 'better-react-use-state';
import * as React from 'react';

export const useCanvasContext2d = (): readonly [
  context: CanvasRenderingContext2D | undefined,
  // React 19 types `React.useRef<T>(null)` as `RefObject<T | null>`: the ref starts
  // out empty and the caller has to say so.
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
] => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const [ctx, setCtx] = useState<CanvasRenderingContext2D | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const canvasEl = canvasRef.current;

    if (canvasEl !== null) {
      const ctx2d = canvasEl.getContext('2d');

      if (ctx2d !== null) {
        setCtx(ctx2d);
      }
    }
  }, [canvasRef]);

  return [ctx, canvasRef];
};
