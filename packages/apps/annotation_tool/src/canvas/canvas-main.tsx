import { memoNamed } from '@noshiro/react-utils';
import { hslaToRgba, Hue, RectSize, Rgba } from '@noshiro/ts-utils';
import { Application, InteractionManager, settings } from 'pixi.js';
import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { addGlobalPointerEventListener } from './functions/add-pointer-event-listener';
import { createGlobalPixiObjects } from './functions/create-global-pixi-objects';
import {
  CanvasAppState,
  defaultCanvasAppState,
} from './state/canvas-state-type';
import { canvasAppStateHandlerGenerator } from './state/state-handler-main';
import { AnnotationCanvasStyle } from './types/annotation-canvas-style';
import { IdType } from './types/id-type';
import { PixiApp } from './types/pixi-app-type';
import { zIndex } from './z-index';

// Pixi.js global settings
settings.SORTABLE_CHILDREN = true;
settings.ROUND_PIXELS = true;

interface Props {
  idMaker: () => IdType;
  canvasStyles: AnnotationCanvasStyle;
  canvasSize: RectSize;
  selectedHue: Hue;
}

export const CanvasMain = memoNamed<Props>('CanvasMain', (props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [pixiApp, setPixiApp] = useState<PixiApp>();

  useEffect(() => {
    // should initialize in useEffect to wait for canvasRef.current initialization
    const app = new Application({
      width: props.canvasSize.width,
      height: props.canvasSize.height,
      transparent: true,
      view: canvasRef.current ?? undefined,
      antialias: false,
    });

    const interactionManager = new InteractionManager(app.renderer);
    interactionManager.cursorStyles.default = 'crosshair';

    const globalPixiObjects = createGlobalPixiObjects({
      app,
      canvasSize: props.canvasSize,
      canvasStyles: props.canvasStyles,
    });

    setPixiApp({ app, ...globalPixiObjects });

    return () => {
      app.destroy();
    };
  }, [props.canvasSize, props.canvasStyles]);

  const newBboxColor = useMemo<{ border: Rgba; face: Rgba }>(
    () => ({
      border: hslaToRgba([
        props.selectedHue,
        ...props.canvasStyles.bbox.borderColorSLA.notSelected,
      ]),
      face: hslaToRgba([
        props.selectedHue,
        ...props.canvasStyles.bbox.highlightedFaceColorSLA,
      ]),
    }),
    [props.selectedHue, props.canvasStyles.bbox]
  );

  const stateRef = useRef<CanvasAppState>(defaultCanvasAppState);

  const canvasAppStateHandler = useMemo(
    () =>
      pixiApp === undefined
        ? undefined
        : canvasAppStateHandlerGenerator(
            pixiApp,
            props.idMaker,
            props.canvasStyles,
            newBboxColor
          ),
    [pixiApp, props.idMaker, props.canvasStyles, newBboxColor]
  );

  useEffect(() => {
    if (pixiApp === undefined || canvasAppStateHandler === undefined) return;

    const removeEventListner = addGlobalPointerEventListener(
      pixiApp.app,
      pixiApp.background,
      stateRef.current,
      canvasAppStateHandler
    );

    return () => {
      removeEventListner();
    };
  }, [
    pixiApp,
    canvasAppStateHandler,
    newBboxColor,
    props.canvasSize,
    props.canvasStyles,
  ]);

  return (
    <canvas
      style={canvasStyle}
      ref={canvasRef}
      width={props.canvasSize.width}
      height={props.canvasSize.height}
    />
  );
});

const canvasStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  zIndex: zIndex.canvasRoot,
};
