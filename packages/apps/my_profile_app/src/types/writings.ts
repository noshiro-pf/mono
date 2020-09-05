import { JsonType } from '@mono/ts-utils';

export interface WritingsInfo {
  link: string;
  title: string;
  subtitle: string;
  body1: string;
  body2: string;
}

export const writingInfo = (obj: JsonType | undefined): WritingsInfo => ({
  link: obj?.link?.toString() ?? '',
  title: obj?.title?.toString() ?? '',
  subtitle: obj?.subtitle?.toString() ?? '',
  body1: obj?.body1?.toString() ?? '',
  body2: obj?.body2?.toString() ?? '',
});
