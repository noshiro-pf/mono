import {
  hslaToRgba,
  type Hue,
  type RectSize,
  type Rgba,
} from '@noshiro/ts-utils-additional';
import {
  Application,
  InteractionManager,
  settings as mut_settings,
} from 'pixi.js-legacy';
import {
  addGlobalPointerEventListener,
  createGlobalPixiObjects,
} from './functions';
import {
  canvasAppStateHandlerGenerator,
  defaultCanvasAppState,
  type CanvasAppState,
} from './state';
import {
  type AnnotationCanvasStyle,
  type IdType,
  type PixiGlobalObjects,
} from './types';
import { zIndex } from './z-index';

type Props = Readonly<{
  idMaker: () => IdType;
  canvasStyles: AnnotationCanvasStyle;
  canvasSize: RectSize;
  selectedHue: Hue;
}>;

export const CanvasMain = memoNamed<Props>('CanvasMain', (props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [pixiGlobalObjects, setPixiGlobalObjects] = useState<
    PixiGlobalObjects | undefined
  >(undefined);

  const [pixiApp, setPixiApp] = useState<Application | undefined>(undefined);

  useEffect(() => {
    // Pixi.js global settings
    mut_settings.SORTABLE_CHILDREN = true;
    mut_settings.ROUND_PIXELS = true;

    // should initialize in useEffect to wait for canvasRef.current initialization
    const _app = new Application({
      width: 100,
      height: 100,
      transparent: true,
      view: canvasRef.current ?? undefined,
      antialias: false,
    });

    const mut_interactionManager = new InteractionManager(_app.renderer);
    mut_interactionManager.cursorStyles['default'] = 'crosshair';

    setPixiApp(_app);

    return () => {
      _app.destroy();
    };
  }, [setPixiApp]);

  useEffect(() => {
    if (pixiApp === undefined) return;
    const globalPixiObjects = createGlobalPixiObjects({
      app: pixiApp,
      canvasSize: props.canvasSize,
      canvasStyles: props.canvasStyles,
    });

    setPixiGlobalObjects(globalPixiObjects);
  }, [pixiApp, props.canvasSize, props.canvasStyles, setPixiGlobalObjects]);

  useEffect(() => {
    pixiApp?.renderer.resize(props.canvasSize.width, props.canvasSize.height);
  }, [pixiApp, props.canvasSize]);

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
    [props.selectedHue, props.canvasStyles.bbox],
  );

  const stateRef = useRef<CanvasAppState>(defaultCanvasAppState);

  const canvasAppStateHandler = useMemo(
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

  useEffect(() => {
    if (
      pixiApp === undefined ||
      pixiGlobalObjects === undefined ||
      canvasAppStateHandler === undefined
    )
      return;

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
};
