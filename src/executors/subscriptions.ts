import { Constructor } from "@kaviar/core";
import { Collection } from "@kaviar/mongo-bundle";

export function ToSubscription<T>(
  collectionClass: Constructor<Collection<T>>,
  optionsResolver
) {
  if (!optionsResolver) {
    // optionsResolver = async (_, args, ctx, ast) => {
    // return
    // return graphqlOptions;
    // };
  }
  return async function (_, args, ctx, ast) {
    const collection = ctx.container.get(collectionClass);

    return collection.queryOneGraphQL(
      ast,
      await optionsResolver(_, args, ctx, ast)
    );
  };
}
