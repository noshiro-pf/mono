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
      <ImgWithLoadingCircle src={fullImgSrc} alt={alt} />
    ) : (
      <ImgWithPreview
        fullImgSrc={fullImgSrc}
        previewImgSrc={previewImgSrc}
        alt={alt}
      />
    )
);
