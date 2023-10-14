import { Application, BLEND_MODES, Point, SimpleRope, Texture } from 'pixi.js';
import { memo, useEffect, useRef } from 'react';
import { RectSize } from '../../../utils';
import TrailImg from '../pixi/trail.png';

interface Props {
  canvasSize: RectSize;
}

export const CanvasExample = memo((props: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const app = new Application({
      width: props.canvasSize.width,
      height: props.canvasSize.height,
      transparent: true,
      view: canvasRef.current ?? undefined,
    });

    const trailTexture = Texture.from(TrailImg);

    // historySize determines how long the trail will be.
    const historySize = 20;
    const historyX: number[] = new Array(historySize).fill(0);
    const historyY: number[] = new Array(historySize).fill(0);

    // ropeSize determines how smooth the trail will be.
    const ropeSize = 100;
    // Create rope points.
    const points: Point[] = new Array(ropeSize)
      .fill(0)
      .map(() => new Point(0, 0));

    // Create the rope
    const rope = new SimpleRope(trailTexture, points);

    // Set the blendmode
    rope.blendMode = BLEND_MODES.ADD;

    app.stage.addChild(rope);

    // Listen for animate update
    app.ticker.add(() => {
      // Read mouse points, this could be done also in mousemove/touchmove update. For simplicity it is done here for now.
      // When implementing this properly, make sure to implement touchmove as interaction plugins mouse might not update on certain devices.
      const mouseposition = app.renderer.plugins.interaction.mouse.global;

      // Update the mouse values to history
      historyX.pop();
      historyY.pop();
      if (pointIsInRect(mouseposition.x, mouseposition.y, props.canvasSize)) {
        historyX.unshift(mouseposition.x);
        historyY.unshift(mouseposition.y);
      } else {
        historyX.unshift(-10);
        historyY.unshift(-10);
      }

      // Update the points to correspond with history.
      for (let i = 0; i < ropeSize; i++) {
        const p = points[i];

        // Smooth the curve with cubic interpolation to prevent sharp edges.
        const ix = cubicInterpolation(historyX, (i / ropeSize) * historySize);
        const iy = cubicInterpolation(historyY, (i / ropeSize) * historySize);

        p.x = ix;
        p.y = iy;
      }
    });

    return () => {
      app.destroy();
    };
  }, [props.canvasSize]);

  return (
    <canvas
      ref={canvasRef}
      width={props.canvasSize.width}
      height={props.canvasSize.height}
    />
  );
});

CanvasExample.displayName = 'CanvasExample';

/**
 * Cubic interpolation based on https://github.com/osuushi/Smooth.js
 */
function clipInput(k: number, arr: number[]): number {
  if (k < 0) k = 0;
  if (k > arr.length - 1) k = arr.length - 1;
  return arr[k];
}

function getTangent(k: number, factor: number, array: number[]): number {
  return (factor * (clipInput(k + 1, array) - clipInput(k - 1, array))) / 2;
}

function cubicInterpolation(
  array: number[],
  t: number,
  tangentFactor?: number,
): number {
  if (tangentFactor == null) tangentFactor = 1;

  const k = Math.floor(t);
  const m = [
    getTangent(k, tangentFactor, array),
    getTangent(k + 1, tangentFactor, array),
  ];
  const p = [clipInput(k, array), clipInput(k + 1, array)];
  t -= k;
  const t2 = t * t;
  const t3 = t * t2;
  return (
    (2 * t3 - 3 * t2 + 1) * p[0] +
    (t3 - 2 * t2 + t) * m[0] +
    (-2 * t3 + 3 * t2) * p[1] +
    (t3 - t2) * m[1]
  );
}

function pointIsInRect(x: number, y: number, rectSize: RectSize): boolean {
  return 0 <= y && y <= rectSize.height && 0 <= x && x <= rectSize.width;
}
