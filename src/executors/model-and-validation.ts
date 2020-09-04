import { ValidatorService } from "@kaviar/validator-bundle";
import { plainToClass } from "class-transformer";

export interface IToModelExecutorOptions {
  field?: string;
}

export function ToModel(model: any, options: IToModelExecutorOptions = {}) {
  if (!options.field) {
    options.field = "input";
  }

  return async function ToModel(_, args, ctx, ast) {
    args[options.field] = plainToClass(model, args[options.field]);
  };
}

export interface IValidateExecutorOptions {
  field?: string;
  model?: any;
}

export function Validate(options: IValidateExecutorOptions = {}) {
  if (!options.field) {
    options.field = "input";
  }

  return async function Validate(_, args, ctx, ast) {
    const validator: ValidatorService = ctx.container.get(ValidatorService);

    await validator.validate(args[options.field], {
      model: options?.model,
    });
  };
}
