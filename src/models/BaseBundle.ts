import {
  Bundle as CoreBundle,
  BundleAfterInitEvent,
  EventManager,
} from "@kaviar/core";
import { Loader } from "@kaviar/graphql-bundle";
import { Collection, MongoBundle } from "@kaviar/mongo-bundle";
import { ValidatorService } from "@kaviar/validator-bundle";

export abstract class BaseBundle<T = any> extends CoreBundle<T> {
  async setupBundle(config: {
    collections?: Record<string, any>;
    listeners?: Record<string, any>;
    serverRoutes?: Record<string, any>;
    validators?: Record<string, any>;
    fixtures?: Record<string, any>;
    graphqlModule?: any | any[];
  }) {
    const {
      collections,
      listeners,
      validators,
      graphqlModule,
      fixtures,
    } = config;

    // Warming up forces instantiation and initialisastion of classes
    if (collections) {
      const eventManager = this.container.get(EventManager);
      eventManager.addListener(BundleAfterInitEvent, (e) => {
        if (e.data.bundle instanceof MongoBundle) {
          this.warmup(
            Object.values(collections).filter(
              (v) => Boolean(v) && v instanceof Collection
            )
          );
        }
      });
    }

    if (listeners) {
      this.warmup(Object.values(listeners).filter((v) => Boolean(v)));
    }

    if (fixtures) {
      this.warmup(Object.values(fixtures).filter((v) => Boolean(v)));
    }

    if (graphqlModule) {
      const loader = this.container.get<Loader>(Loader);
      loader.load(graphqlModule);
    }

    // Adding validators
    if (validators) {
      const validator = this.container.get<ValidatorService>(ValidatorService);
      Object.values(validators)
        .filter((v) => Boolean(v))
        .forEach((validatorClass) => validator.addMethod(validatorClass));
    }
  }
}
