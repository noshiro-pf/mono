export type Routes = Readonly<{
  profile: string;
  skills: string;
  profile2: string;
  products: string;
  writings: string;
}>;

export const routes = {
  profile: '/profile',
  skills: '/skills',
  profile2: '/profile2',
  products: '/products',
  writings: '/writings',
} as const;

export const labels = {
  profile: 'Profile',
  profile2: 'Profile2',
  skills: 'Skills',
  products: 'Products',
  writings: 'Writings',
} as const;

export const tabKeys: readonly (keyof Routes)[] = [
  'profile',
  'skills',
  'profile2',
  'products',
  'writings',
] as const;

export const routeList = tabKeys.map((k) => routes[k]);
export const labelList = tabKeys.map((k) => labels[k]);
