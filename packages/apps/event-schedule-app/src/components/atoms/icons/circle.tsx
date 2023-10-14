type Props = Readonly<{
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}>;

export const CircleIcon = memoNamed<Props>(
  'CircleIcon',
  ({ size = 16, color = 'black', style }) => (
    <svg
      fill='none'
      height={size}
      style={style}
      viewBox='0 0 32 32'
      width={size}
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M16 32C7.17775 32 0 24.8223 0 16C0 7.17775 7.17775 0 16 0C24.8223 0 32 7.17775 32 16C32 24.8223 24.8223 32 16 32ZM16 3.2C8.2803 3.2 3.2 8.28128 3.2 16C3.2 23.7187 8.2803 28.8 16 28.8C23.7197 28.8 28.8 23.7187 28.8 16C28.8 8.28128 23.7197 3.2 16 3.2Z'
        fill={color}
      />
    </svg>
  ),
);
