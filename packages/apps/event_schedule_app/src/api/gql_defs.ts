import { gql } from 'apollo-boost';

export const query = {
  findAllTodos: gql`
    query FindAllTodos {
      allTodos {
        data {
          _id
          title
          completed
        }
      }
    }
  `,
  createTodo: gql`
    mutation CreateATodo($title: String!) {
      createTodo(data: { title: $title, completed: false }) {
        title
        completed
      }
    }
  `,
};
