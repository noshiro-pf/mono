import { memoNamed } from '@noshiro/react-utils';
import { ImgWithPreview } from '@noshiro/react-utils-styled';
import { ImgWithLoadingCircle } from './img-with-loading-circle';

type Props = Readonly<{
  fullImgSrc: string;
  previewImgSrc?: string;
  alt?: string;
}>;

export const ImgWithLoadingState = memoNamed<Props>(
  'ImgWithLoadingState',
  ({ fullImgSrc, previewImgSrc, alt = '' }: Props) =>
    previewImgSrc === undefined ? (
      <ImgWithLoadingCircle alt={alt} src={fullImgSrc} />
    ) : (
      <ImgWithPreview
        alt={alt}
        fullImgSrc={fullImgSrc}
        previewImgSrc={previewImgSrc}
      />
    ),
);
