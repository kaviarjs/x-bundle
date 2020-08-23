import { Bundle as CoreBundle } from "@kaviar/core";
import { Loader } from "@kaviar/loader";
import { ValidatorService } from "@kaviar/validator";

export abstract class BaseBundle<T> extends CoreBundle<T> {
  async setupBundle(config: {
    collections?: Record<string, any>;
    listeners?: Record<string, any>;
    serverRoutes?: Record<string, any>;
    validators?: Record<string, any>;
    fixtures?: Record<string, any>;
    graphqlModule?: any;
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
      this.warmup(Object.values(collections).filter((v) => Boolean(v)));
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
