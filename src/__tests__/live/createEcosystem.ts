// Create a kernel with a bundle

import { Kernel, ContainerInstance } from "@kaviar/core";
import { MongoBundle } from "@kaviar/mongo-bundle";
import { ApolloBundle } from "@kaviar/apollo-bundle";
import { XBundle } from "../../XBundle";
import { LoggerBundle } from "@kaviar/logger-bundle";

export async function createEcosystem(): Promise<ContainerInstance> {
  const kernel = new Kernel({
    bundles: [
      new LoggerBundle(),
      new MongoBundle({
        uri: "mongodb://localhost:27017/tests",
      }),
      new XBundle({
        live: {
          redis: {
            debug: true,
          },
        },
      }),
      new ApolloBundle(),
    ],
    parameters: {
      testing: true,
    },
  });

  await kernel.init();

  return kernel.container;
}
