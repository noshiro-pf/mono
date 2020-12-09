export interface Routes {
  profile: string;
  skills: string;
  profile2: string;
  products: string;
  writings: string;
}

export const routes = {
  profile: '/profile',
  skills: '/skills',
  profile2: '/profile2',
  products: '/products',
  writings: '/writings',
};

export const labels = {
  profile: 'Profile',
  profile2: 'Profile2',
  skills: 'Skills',
  products: 'Products',
  writings: 'Writings',
};

export const tabKeys: (keyof Routes)[] = [
  'profile',
  'skills',
  'profile2',
  'products',
  'writings',
];

export const routeList = tabKeys.map((k) => routes[k]);
export const labelList = tabKeys.map((k) => labels[k]);
