import { Inject } from "@kaviar/core";
import { X_SETTINGS, APPLICATION_URL } from "../constants";
import { IXBundleConfig } from "../defs";

/**
 * This router is mostly used by emails and others to properly link to your application url
 */
export class Router {
  baseUrl: string;

  constructor(@Inject(APPLICATION_URL) baseUrl: string) {
    if (baseUrl.endsWith("/")) {
      this.baseUrl = baseUrl.slice(0, -1);
    } else {
      this.baseUrl = baseUrl;
    }
  }

  path(route, variables: RouteVariables = {}) {
    // TODO: make it work with query params also: ?userId=:userId

    const parts = route.split("/");
    for (let i = 0; i < parts.length; i++) {
      if (parts[i][0] === ":") {
        parts[i] = variables[parts[i].slice(1)];
      }
    }

    route = parts.join("/");

    if (route[0] !== "/") {
      route = "/" + route;
    }

    return this.baseUrl + route;
  }
}

export type RouteVariables = {
  [key: string]: string | number;
};
