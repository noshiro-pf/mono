export type Routes = Readonly<{
  career: string;
  skills: string;
  biography: string;
  products: string;
  writings: string;
}>;

export const routes = {
  career: '/career/',
  skills: '/skills/',
  biography: '/biography/',
  products: '/products/',
  writings: '/writings/',
} as const;

export const labels = {
  career: '経歴',
  biography: '自己紹介',
  skills: 'スキル',
  products: '製作物',
  writings: '執筆物',
} as const;

export const tabKeys: readonly (keyof Routes)[] = [
  'career',
  'biography',
  'skills',
  'products',
  'writings',
] as const;

export const routeList = tabKeys.map((k) => routes[k]);
export const labelList = tabKeys.map((k) => labels[k]);
