import { GraphQLScalarType } from "graphql";
import { Kind } from "graphql/language";
import { ObjectId } from "bson";

export default {
  typeDefs: `scalar ObjectId`,
  resolvers: {
    Date: new GraphQLScalarType({
      name: "ObjectId",
      description: "Date Custom scalar type",
      parseValue(value) {
        return new ObjectId(value);
      },
      serialize(value: ObjectId) {
        return value.toString();
      },
      parseLiteral(ast) {
        if (ast.kind === Kind.STRING) {
          return new ObjectId(ast.value); // ast value is always in string format
        }
        return null;
      },
    }),
  },
};
