import { useState } from 'better-preact-use-state';
import * as Preact from 'preact/hooks';

export const useCanvasContext2d = (): readonly [
  CanvasRenderingContext2D | undefined,
  preact.Ref<HTMLCanvasElement | null>,
] => {
  const canvasRef = Preact.useRef<HTMLCanvasElement | null>(null);

  const [ctx, setCtx] = useState<CanvasRenderingContext2D | undefined>(
    undefined,
  );

  Preact.useEffect(() => {
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
