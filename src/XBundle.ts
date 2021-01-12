import { Bundle, MissingParameterException } from "@kaviar/core";
import { ValidatorService } from "@kaviar/validator-bundle";
import { MongoBundle } from "@kaviar/mongo-bundle";
import { LoggerBundle } from "@kaviar/logger-bundle";
import { Loader } from "@kaviar/graphql-bundle";

import { UniqueFieldValidationMethod } from "./validators/UniqueFieldValidationMethod";
import { DateTransformer } from "./validators/DateTransformer";
import CRUDTypes from "./crud/types";
import scalars from "./scalars";
import {
  X_SETTINGS,
  X_WAY,
  RANDOM_GEEKIE_DEV_QUOTES,
  APP_ROUTER,
  ROOT_ROUTER,
} from "./constants";
import { IXBundleConfig } from "./defs";
import * as chalk from "chalk";
import { execSync } from "child_process";
import { Router } from "./services/Router";

export class XBundle extends Bundle<IXBundleConfig> {
  dependencies = [MongoBundle, LoggerBundle];

  defaultConfig = {
    logo: X_WAY,
    appUrl: "http://localhost:3000",
    rootUrl: "http://localhost:4000",
  };

  async prepare() {
    this.container.set(X_SETTINGS, this.config);

    const { appUrl, rootUrl } = this.config;
    if (appUrl) {
      this.container.set(APP_ROUTER, new Router(appUrl));
    }
    if (rootUrl) {
      this.container.set(ROOT_ROUTER, new Router(rootUrl));
    }

    if (this.kernel.isDevelopment()) {
      this.displayWelcomeMessage();
    }
  }

  async init() {
    const validator = this.container.get<ValidatorService>(ValidatorService);
    const loader = this.container.get<Loader>(Loader);

    validator.addMethod(UniqueFieldValidationMethod);
    validator.addTransformer(DateTransformer);

    loader.load([CRUDTypes, ...scalars]);
  }

  public displayWelcomeMessage() {
    console.log(chalk.yellowBright(`${this.config.logo}`));

    // Just trying to center the text here.
    const logoLength = X_WAY.split("\n")[1].length;
    const myMessage = RANDOM_GEEKIE_DEV_QUOTES[
      Math.floor(Math.random() * RANDOM_GEEKIE_DEV_QUOTES.length)
    ].replace("%name%", this.getFirstName());

    console.log(
      " ".repeat(logoLength / 2 - myMessage.length / 2),
      chalk.bold.green(myMessage)
    );
    console.log("");
  }

  /**
   * I'm sure you got a little bit worried how this npm package has access to your name.
   * Well.. curiosity brought you here, and I'm happy you are curious about the code you are using.
   */
  protected getFirstName(): string | null {
    try {
      const name = execSync("git config --get user.name").toString();
      return name.split(" ")[0];
    } catch (e) {
      return "Anonymous";
    }
  }
}
