import { useState } from 'better-react-use-state';
import {
  Application,
  InteractionManager,
  settings as mut_settings,
} from 'pixi.js-legacy';
import * as React from 'react';
import { memoNamed } from 'react-utils';
import { Arr } from 'ts-data-forge';
import {
  hslaToRgba,
  type Hue,
  type RectSize,
  type Rgba,
} from 'ts-utils-additional';
import {
  addGlobalPointerEventListener,
  createGlobalPixiObjects,
} from './functions/index.mjs';
import {
  canvasAppStateHandlerGenerator,
  defaultCanvasAppState,
  type CanvasAppState,
} from './state/index.mjs';
import {
  type AnnotationCanvasStyle,
  type IdType,
  type PixiApp,
} from './types/index.mjs';
import { zIndex } from './z-index.mjs';

// Pixi.js global settings
mut_settings.SORTABLE_CHILDREN = true;

mut_settings.ROUND_PIXELS = true;

type Props = Readonly<{
  idMaker: () => IdType;
  canvasStyles: AnnotationCanvasStyle;
  canvasSize: RectSize;
  selectedHue: Hue;
}>;

export const CanvasMain = memoNamed<Props>('CanvasMain', (props) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const [pixiApp, setPixiApp] = useState<PixiApp | undefined>(undefined);

  React.useEffect(() => {
    // should initialize in useEffect to wait for canvasRef.current initialization
    const app = new Application({
      width: props.canvasSize.width,
      height: props.canvasSize.height,
      transparent: true,
      view: canvasRef.current ?? undefined,
      antialias: false,
    });

    const mut_interactionManager = new InteractionManager(app.renderer);

    mut_interactionManager.cursorStyles['default'] = 'crosshair';

    const globalPixiObjects = createGlobalPixiObjects({
      app,
      canvasSize: props.canvasSize,
      canvasStyles: props.canvasStyles,
    });

    setPixiApp({ app, ...globalPixiObjects });

    return () => {
      app.destroy();
    };
  }, [props.canvasSize, props.canvasStyles, setPixiApp]);

  const newBboxColor = React.useMemo<Readonly<{ border: Rgba; face: Rgba }>>(
    () => ({
      border: hslaToRgba(
        Arr.toUnshifted(props.selectedHue)(
          props.canvasStyles.bbox.borderColorSLA.notSelected,
        ),
      ),
      face: hslaToRgba(
        Arr.toUnshifted(props.selectedHue)(
          props.canvasStyles.bbox.highlightedFaceColorSLA,
        ),
      ),
    }),
    [props.selectedHue, props.canvasStyles.bbox],
  );

  const stateRef = React.useRef<CanvasAppState>(defaultCanvasAppState);

  const canvasAppStateHandler = React.useMemo(
    () =>
      pixiApp === undefined
        ? undefined
        : canvasAppStateHandlerGenerator(
            pixiApp,
            props.idMaker,
            props.canvasStyles,
            newBboxColor,
          ),
    [pixiApp, props.idMaker, props.canvasStyles, newBboxColor],
  );

  React.useEffect(() => {
    if (pixiApp === undefined || canvasAppStateHandler === undefined) return;

    const removePointerEventListener = addGlobalPointerEventListener(
      pixiApp.app,
      pixiApp.background,
      stateRef.current,
      canvasAppStateHandler,
    );

    return () => {
      removePointerEventListener();
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
      ref={canvasRef}
      height={props.canvasSize.height}
      style={canvasStyle}
      width={props.canvasSize.width}
    />
  );
});

const canvasStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  zIndex: zIndex.canvasRoot,
} as const;
