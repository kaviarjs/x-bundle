import { Constructor } from "@kaviar/core";
import { Collection } from "@kaviar/mongo-bundle";
import { SubscriptionStore } from "../services/SubscriptionStore";
import { IGraphQLContext } from "@kaviar/graphql-bundle";

export function ToSubscription<T>(
  collectionClass: Constructor<Collection<T>>,
  bodyResolver
) {
  if (!bodyResolver) {
    bodyResolver = async (_, args, ctx: IGraphQLContext, ast) => args.body;
  }
  return async function (_, args, ctx: IGraphQLContext, ast) {
    const { container } = ctx;
    const collection = container.get(collectionClass);
    const subscriptionStore = container.get(SubscriptionStore);
    const body = await bodyResolver(_, args, ctx, ast);

    return subscriptionStore.createAsyncIterator(collection, body);
  };
}

export function ToSubscriptionCount<T>(
  collectionClass: Constructor<Collection<T>>,
  filtersResolver
) {
  if (!filtersResolver) {
    filtersResolver = async (_, args, ctx: IGraphQLContext, ast) =>
      args.filters;
  }
  return async function (_, args, ctx: IGraphQLContext, ast) {
    const { container } = ctx;
    const collection = container.get(collectionClass);
    const subscriptionStore = container.get(SubscriptionStore);
    const filters = await filtersResolver(_, args, ctx, ast);

    return subscriptionStore.createAsyncIteratorForCounting(
      collection,
      filters
    );
  };
}
