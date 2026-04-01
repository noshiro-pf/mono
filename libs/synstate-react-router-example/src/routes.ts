import { createRouter, defineRoutes, param } from 'synstate-react-router';

/** Branded type for product IDs. */
export type ProductId = Brand<string, 'ProductId'>;

/** Branded type for user IDs. */
export type UserId = Brand<string, 'UserId'>;

export const routes = defineRoutes({
  home: {
    segment: '',
  },
  products: {
    queryParams: {
      page: param.query.number({ default: 1 }),
      search: param.query.string(),
    },
    children: {
      item: {
        params: { productId: param.path.string },
      },
    },
  },
  users: {
    children: {
      item: {
        params: { userId: param.path.string },
      },
    },
  },
  settings: {},
});

export const router = createRouter(routes);
