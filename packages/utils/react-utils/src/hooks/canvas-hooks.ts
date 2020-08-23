import { RefObject, useEffect, useRef, useState } from 'react';

export const useCanvasContext2d = (): [
  CanvasRenderingContext2D | undefined,
  RefObject<HTMLCanvasElement>
] => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | undefined>(
    undefined
  );

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
