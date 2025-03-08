type Props = Readonly<{
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}>;

export const TriangleIcon = memoNamed<Props>(
  'TriangleIcon',
  ({ size: iconSize = 16, color = 'black', style }) => (
    <svg
      fill={'none'}
      height={iconSize}
      style={style}
      viewBox={'0 0 32 32'}
      width={iconSize}
      xmlns={'http://www.w3.org/2000/svg'}
    >
      <g>
        <path
          d={
            'M30.5202 30.0507L30.512 30.0507L1.47986 30.0507C0.951413 30.0507 0.462572 29.7687 0.198244 29.3108C-0.0660844 28.8529 -0.0660145 28.2889 0.198244 27.831L14.7143 2.68902C14.9786 2.23105 15.4674 1.94905 15.996 1.94905C16.5244 1.94905 17.0131 2.23105 17.2774 2.68902L31.722 27.7063C31.897 27.9495 32 28.2478 32 28.5709C32 29.3882 31.3376 30.0507 30.5202 30.0507ZM3.60223 27.0911L27.9489 27.0911L15.996 6.3885L3.60223 27.0911Z'
          }
          fill={color}
        />
      </g>
      <defs>
        <clipPath id={'clip0'}>
          <rect
            fill={'white'}
            height={'32'}
            transform={'translate(32 32) rotate(-180)'}
            width={'32'}
          />
        </clipPath>
      </defs>
    </svg>
  ),
);
