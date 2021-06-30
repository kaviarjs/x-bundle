import { Collection } from "@kaviar/mongo-bundle";
import { lookup } from "@kaviar/nova";
import { Constructor, ContainerInstance } from "@kaviar/core";

export function performRelationalSorting(
  container: ContainerInstance,
  collectionClass: Constructor<Collection> & typeof Collection,
  sort: {
    [key: string]: any;
  }
) {
  const pipeline = [];
  for (const key in sort) {
    // We detect if the sort is by a link
    const parts = key.split(".");
    const [linkName, ...restParts] = parts;
    if (collectionClass.links[linkName]) {
      const collection = container.get<Collection>(collectionClass);

      pipeline.push(lookup(collection.collection, linkName), {
        $sort: {
          [key]: sort[key],
        },
      });
    }
  }

  return pipeline;
}
