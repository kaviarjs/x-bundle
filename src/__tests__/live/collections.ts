import { Collection } from "@kaviar/mongo-bundle";
import { live } from "../../behaviors/live.behavior";

export class PostsCollection extends Collection {
  static collectionName = "posts";

  static behaviors = [live()];
}
