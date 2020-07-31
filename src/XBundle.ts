import { Bundle } from "@kaviar/core";
import { ValidatorService } from "@kaviar/validator";
import { MongoBundle } from "@kaviar/mongo-bundle";
import { LoggerBundle } from "@kaviar/logger-bundle";
import { Loader } from "@kaviar/loader";

import { UniqueFieldValidationMethod } from "./validators/UniqueFieldValidationMethod";
import { DateTransformer } from "./validators/DateTransformer";
import CRUDTypes from "./crud/types";
import ObjectIdScalar from "./scalars/ObjectId.scalar";
import { X_SETTINGS, APPLICATION_URL } from "./constants";
import { IXBundleConfig } from "./defs";

export class XBundle extends Bundle<IXBundleConfig> {
  dependencies = [MongoBundle, LoggerBundle];

  protected defaultConfig = {
    applicationUrl: "http://localhost:3000",
  };

  async prepare() {
    this.container.set(X_SETTINGS, this.config);
    this.container.set(APPLICATION_URL, this.config.applicationUrl);
  }

  async init() {
    const validator = this.container.get<ValidatorService>(ValidatorService);
    const loader = this.container.get<Loader>(Loader);

    validator.addMethod(UniqueFieldValidationMethod);
    validator.addTransformer(DateTransformer);

    loader.load([CRUDTypes, ObjectIdScalar]);
  }
}
