import { GraphQLScalarType } from "graphql";
import { Kind } from "graphql/language";
import { ObjectID } from "@kaviar/mongo-bundle";

export default {
  typeDefs: `scalar ObjectId`,
  resolvers: {
    ObjectId: new GraphQLScalarType({
      name: "ObjectId",
      description: "ObjectId custom scalar type",
      parseValue(value) {
        return new ObjectID(value);
      },
      serialize(value: ObjectID) {
        return value.toString();
      },
      parseLiteral(ast) {
        if (ast.kind === Kind.STRING) {
          return new ObjectID(ast.value); // ast value is always in string format
        }
        return null;
      },
    }),
  },
};
