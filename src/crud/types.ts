export default {
  typeDefs: `
    input QueryInput {
      filters: EJSON
      options: QueryOptionsInput
    }

    input QueryOptionsInput {
      sort: JSON
      limit: Int
      skip: Int
    }

    input DocumentUpdateInput {
      _id: ObjectId!
      modifier: EJSON!
    }
  `,
};
