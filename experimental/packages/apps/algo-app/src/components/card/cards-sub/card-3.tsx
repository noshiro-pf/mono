import { type CardProps } from './card-props';

export const Card3 = memoNamed('Card3', ({ color, textColor }: CardProps) => (
  <>
    <path
      d={
        'M126.5 143C126.5 166.196 104.338 185 77 185C49.6619 185 27.5 166.196 27.5 143C27.5 119.804 48.5 106.071 77 102C112 97 126.5 119.804 126.5 143Z'
      }
      fill={textColor}
    />
    <path d={'M32.3 169L64.5 142.75L18.5 127L32.3 169Z'} fill={color} />
    <path
      d={'M83.5 84.5L59.5 117L64.6089 146.5L15 128L83.5 84.5Z'}
      fill={color}
    />
    <path
      d={
        'M104.5 139.5C104.5 153.031 92.1878 164 77 164C61.8122 164 49.5 153.031 49.5 139.5C49.5 125.969 44 117 77 115C92.1878 115 104.5 125.969 104.5 139.5Z'
      }
      fill={color}
    />
    <path
      d={'M125 60L93.5 102.5L68.5 105L86.5 80H41.5V60H125Z'}
      fill={textColor}
    />
  </>
));
