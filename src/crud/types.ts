export default {
  typeDefs: `
    input QueryInput {
      filters: JSON!
      options: QueryOptionsInput!
    }

    input QueryOptionsInput {
      sort: JSON
      limit: Int
      skip: Int
    }

    input DocumentUpdateInput {
      _id: ID!
      dataSet: JSON!
    }

    input DocumentDeleteInput {
      _id: ID!
    }
  `,
};
