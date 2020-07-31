import "@kaviar/validator";
import { IUniqueFieldValidationConfig } from "./UniqueFieldValidationMethod";
import { ObjectIdSchema } from "./ObjectId.validator";

declare module "@kaviar/validator" {
  export module yup {
    export interface DateSchema<T> {
      /**
       * @param format Look for available formats here: https://date-fns.org/v2.14.0/docs/format
       */
      format(format?: string): DateSchema<T>;
    }

    export interface StringSchema<T> {
      /**
       * Specify a unique constraint for this field
       */
      uniqueField(config?: IUniqueFieldValidationConfig): StringSchema<T>;
    }

    export interface NumberSchema<T> {
      /**
       * Specify a unique constraint for this field
       */
      uniqueField(config?: IUniqueFieldValidationConfig): NumberSchema<T>;
    }

    export { ObjectIdSchema };

    export type ObjectIdSchemaConstructor = {
      new (): ObjectIdSchema;
    };

    export const objectId: () => ObjectIdSchema;
  }
}
