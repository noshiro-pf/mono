import { useEffect, useRef, type Ref } from 'preact/hooks';
import { useState } from './use-state';

export const useCanvasContext2d = (): [
  CanvasRenderingContext2D | undefined,
  Ref<HTMLCanvasElement | null>
] => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { state: ctx, setState: setCtx } = useState<
    CanvasRenderingContext2D | undefined
  >(undefined);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (canvasEl !== null) {
      const ctx2d = canvasEl.getContext('2d');
      if (ctx2d !== null) {
        setCtx(ctx2d);
      }
    }
  }, [canvasRef, setCtx]);

  return [ctx, canvasRef];
};
