import { JsonType } from '@mono/ts-utils';

export interface ProductsInfo {
  link: string;
  title: string;
  subtitle: string;
  body1: string;
  body2: string;
  imageUrl: string;
}

export const productsInfo = (obj: JsonType | undefined): ProductsInfo => ({
  link: obj?.link?.toString() ?? '',
  title: obj?.title?.toString() ?? '',
  subtitle: obj?.subtitle?.toString() ?? '',
  body1: obj?.body1?.toString() ?? '',
  body2: obj?.body2?.toString() ?? '',
  imageUrl: obj?.imageUrl?.toString() ?? '',
});
