import { Json } from '../utils/type';

export interface WritingsInfo {
  link: string;
  title: string;
  subtitle: string;
  body1: string;
  body2: string;
}

export const writingInfo = (obj: Json | undefined): WritingsInfo => ({
  link: obj?.link?.toString() ?? '',
  title: obj?.title?.toString() ?? '',
  subtitle: obj?.subtitle?.toString() ?? '',
  body1: obj?.body1?.toString() ?? '',
  body2: obj?.body2?.toString() ?? '',
});
