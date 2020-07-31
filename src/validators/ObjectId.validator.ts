import { yup } from "@kaviar/validator";
import { ObjectId } from "bson";

export class ObjectIdSchema extends yup.mixed {
  constructor() {
    super({ type: "objectId" });

    this.withMutation((schema) => {
      schema.transform(function (value) {
        if (this.isType(value)) return value;
        return new ObjectId(value);
      });
    });
  }

  _typeCheck(value) {
    return ObjectId.isValid(value);
  }
}

// @ts-ignore
// Ignore it because it's a readonly property
yup.objectId = () => new ObjectIdSchema();
