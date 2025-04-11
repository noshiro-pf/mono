import { type Rect, type RectSize } from '@noshiro/ts-utils-additional';
import { createElement } from 'preact';
import { outlineColorDef, zIndex, type CustomColor } from '../../constants';
import {
  type CardColor,
  type CardNumber,
  type VisibilityFromMe,
} from '../../types';
import {
  Card0,
  Card1,
  Card10,
  Card11,
  Card2,
  Card3,
  Card4,
  Card5,
  Card6,
  Card7,
  Card8,
  Card9,
} from './cards-sub';
import { useCardAttributes } from './use-card-attributes';

type OptionalProps = Readonly<{
  size: Partial<RectSize>;
  visibilityFromMe: VisibilityFromMe;
  float: 'always' | 'never' | 'onHover';
  showOutline: 'always' | 'never' | 'onHover';
  outlineColor: CustomColor;
  isClickable: boolean;
  hidden: boolean;
  onClick: () => void;
  windowSize: RectSize;
  onBoundingClientRectChange: (rect: Rect) => void;
}>;

type RequiredProps = Readonly<{
  color: CardColor;
  number: CardNumber;
}>;

type Props = Partial<OptionalProps> & RequiredProps;

const CardComponents = [
  Card0,
  Card1,
  Card2,
  Card3,
  Card4,
  Card5,
  Card6,
  Card7,
  Card8,
  Card9,
  Card10,
  Card11,
] as const;

export const CardComponent = memoNamed<Props>(
  'Card',
  ({
    color,
    number,
    size,
    visibilityFromMe = 'faceUp',
    float = 'never',
    showOutline = 'never',
    outlineColor = outlineColorDef.green,
    isClickable = false,
    hidden = false,
    onClick = noop,
    windowSize,
    onBoundingClientRectChange,
  }: Props) => {
    const {
      textColor,
      eyeIconColor,
      wrapperStyle,
      backSideStyle,
      frontSideStyle,
      rectStyle,
      onMouseEnter,
      onMouseLeave,
    } = useCardAttributes(
      color,
      size,
      visibilityFromMe,
      isClickable,
      hidden,
      float,
      showOutline,
      outlineColor,
    );

    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
      const el = ref.current;
      if (
        windowSize !== undefined &&
        onBoundingClientRectChange !== undefined &&
        el !== null
      ) {
        onBoundingClientRectChange(el.getBoundingClientRect());
      }
    }, [windowSize, onBoundingClientRectChange]);

    return (
      <div ref={ref}>
        {hidden ? (
          <Wrapper style={wrapperStyle}>
            <SvgStyled
              fill={'none'}
              style={backSideStyle}
              viewBox={'0 0 161 241'}
              xmlns={'http://www.w3.org/2000/svg'}
            >
              <rect
                height={233}
                rx={18}
                style={rectStyle}
                width={153}
                x={4}
                y={4}
              />
            </SvgStyled>
          </Wrapper>
        ) : (
          <Wrapper
            style={wrapperStyle}
            onClick={isClickable ? onClick : undefined}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            <SvgStyled
              fill='none'
              style={backSideStyle}
              viewBox='0 0 161 241'
              xmlns='http://www.w3.org/2000/svg'
            >
              <rect
                height={233}
                rx={18}
                style={rectStyle}
                width={153}
                x={4}
                y={4}
              />
              {visibilityFromMe === 'faceDownButVisibleToMe'
                ? createElement(CardComponents[number], { color, textColor })
                : undefined}

              {visibilityFromMe === 'faceDownButVisibleToCounter' ||
              visibilityFromMe === 'faceDownButVisibleToMe' ? (
                <>
                  <path
                    d='M29.981 17L38.6248 23.7642H21.3372L29.981 17Z'
                    fill={eyeIconColor}
                  />
                  <rect
                    fill={eyeIconColor}
                    height='8'
                    width='7'
                    x='26.481'
                    y='23'
                  />
                  <path
                    d='M27.8273 34.6269C24.3462 36.7661 18 42.3955 18 55.0055C18 67.5669 24.2972 73.2013 27.7868 75.3593C29.1685 76.2136 30.9301 76.2136 32.3117 75.3593C35.8013 73.2013 42.0986 67.567 42.0986 55.0055C42.0986 42.3955 35.7525 36.7661 32.2713 34.6269C30.9114 33.791 29.1873 33.791 27.8273 34.6269ZM31.2737 45.7729C35.4218 46.3025 38.7673 49.6567 39.2852 53.8062C40.0444 59.889 34.9328 65.0006 28.85 64.2413C24.7006 63.7235 21.3463 60.3778 20.8168 56.2298C20.0382 50.1314 25.1753 44.9944 31.2737 45.7729Z'
                    fill={eyeIconColor}
                  />
                  <path
                    d='M28.885 52.884C28.7362 53.4012 28.3166 53.824 27.8001 53.9754C26.9384 54.2283 26.131 53.784 25.8154 53.0748C25.5444 53.6636 25.3938 54.3154 25.3938 55.0056C25.3938 57.5978 27.5217 59.699 30.1198 59.6604C32.5887 59.6237 34.6674 57.545 34.7041 55.076C34.7428 52.478 32.6414 50.3499 30.0492 50.3499C29.2797 50.3499 28.5512 50.539 27.9104 50.873C28.6588 51.1684 29.1398 51.9983 28.885 52.884Z'
                    fill={eyeIconColor}
                  />
                </>
              ) : undefined}
            </SvgStyled>

            <SvgStyled
              fill='none'
              style={frontSideStyle}
              viewBox='0 0 161 241'
              xmlns='http://www.w3.org/2000/svg'
            >
              <rect
                height={233}
                rx={18}
                style={rectStyle}
                width={153}
                x={4}
                y={4}
              />
              {visibilityFromMe === 'faceUp'
                ? createElement(CardComponents[number], { color, textColor })
                : undefined}
            </SvgStyled>
          </Wrapper>
        )}
      </div>
    );
  },
);

const Wrapper = styled('div')`
  display: flex;
  justify-content: center;
  align-items: center;

  position: relative;
  transition-property: transform;
  transition-duration: 0.3s;
  z-index: ${zIndex.cards};
`;

const SvgStyled = styled('svg')`
  /* 裏面と表面を重ねる */
  position: absolute;
  top: 0;
  left: 0;
  backface-visibility: hidden;
  width: 100%;
  height: 100%;

  transition-property: transform;
  transition-duration: 0.6s;
  perspective: 500px;
`;
