import ApolloClient from 'apollo-boost';
import { FAUNADB_KEY } from '../env-vars';

export const client = new ApolloClient({
  uri: 'https://graphql.fauna.com/graphql',
  headers: {
    Authorization: `Bearer ${FAUNADB_KEY}`,
    'X-Schema-Preview': 'partial-update-mutation',
  },
});
