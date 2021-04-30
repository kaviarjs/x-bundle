import { yup } from "@kaviar/validator-bundle";
import { ObjectId } from "@kaviar/ejson";

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
    try {
      return ObjectId.isValid(value);
    } catch (e) {
      return false;
    }
  }
}

// @ts-ignore
// Ignore it because it's a readonly property
yup.objectId = () => new ObjectIdSchema();
