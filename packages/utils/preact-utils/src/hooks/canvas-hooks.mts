import { useState } from 'better-preact-use-state';
import { useEffect, useRef } from 'preact/hooks';

export const useCanvasContext2d = (): [
  CanvasRenderingContext2D | undefined,
  preact.Ref<HTMLCanvasElement | null>,
] => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | undefined>(
    undefined,
  );

  useEffect(() => {
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
