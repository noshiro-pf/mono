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
import type {
  AnnotationCanvasStyle,
  IdType,
  PixiGlobalObjects,
} from './types/index.mjs';
import { zIndex } from './z-index.mjs';

type Props = Readonly<{
  idMaker: () => IdType;
  canvasStyles: AnnotationCanvasStyle;
  canvasSize: RectSize;
  selectedHue: Hue;
}>;

export const CanvasMain = memoNamed<Props>('CanvasMain', (props) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const [pixiGlobalObjects, setPixiGlobalObjects] = useState<
    PixiGlobalObjects | undefined
  >(undefined);

  const [pixiApp, setPixiApp] = useState<Application | undefined>(undefined);

  React.useEffect(() => {
    // Pixi.js global settings
    mut_settings.SORTABLE_CHILDREN = true;

    mut_settings.ROUND_PIXELS = true;

    // should initialize in useEffect to wait for canvasRef.current initialization
    // The size is a placeholder: the renderer is resized to `props.canvasSize`
    // below, so the application is not recreated when the size changes.
    const app = new Application({
      width: 100,
      height: 100,
      transparent: true,
      view: canvasRef.current ?? undefined,
      antialias: false,
    });

    const mut_interactionManager = new InteractionManager(app.renderer);

    mut_interactionManager.cursorStyles['default'] = 'crosshair';

    setPixiApp(app);

    return () => {
      app.destroy();
    };
  }, [setPixiApp]);

  React.useEffect(() => {
    if (pixiApp === undefined) {
      return;
    }

    const globalPixiObjects = createGlobalPixiObjects({
      app: pixiApp,
      canvasSize: props.canvasSize,
      canvasStyles: props.canvasStyles,
    });

    setPixiGlobalObjects(globalPixiObjects);
  }, [pixiApp, props.canvasSize, props.canvasStyles, setPixiGlobalObjects]);

  React.useEffect(() => {
    pixiApp?.renderer.resize(props.canvasSize.width, props.canvasSize.height);
  }, [pixiApp, props.canvasSize]);

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
      pixiApp === undefined || pixiGlobalObjects === undefined
        ? undefined
        : canvasAppStateHandlerGenerator(
            pixiApp,
            pixiGlobalObjects,
            props.idMaker,
            props.canvasStyles,
            newBboxColor,
          ),
    [
      pixiApp,
      pixiGlobalObjects,
      props.idMaker,
      props.canvasStyles,
      newBboxColor,
    ],
  );

  React.useEffect(() => {
    if (
      pixiApp === undefined ||
      pixiGlobalObjects === undefined ||
      canvasAppStateHandler === undefined
    ) {
      return;
    }

    const removePointerEventListener = addGlobalPointerEventListener(
      pixiApp,
      pixiGlobalObjects.background,
      stateRef.current,
      canvasAppStateHandler,
    );

    return removePointerEventListener;
  }, [
    pixiApp,
    pixiGlobalObjects,
    canvasAppStateHandler,
    newBboxColor,
    props.canvasSize,
    props.canvasStyles,
  ]);

  return (
    <canvas
      ref={canvasRef}
      data-e2e={'annotation-canvas'}
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
