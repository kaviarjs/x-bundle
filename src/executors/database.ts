import { Collection, DocumentNotFoundException } from "@kaviar/mongo-bundle";
import { getResult } from "@kaviar/graphql-bundle";
import { IAstToQueryOptions, IParamaterableObject } from "@kaviar/nova";
import { Constructor } from "@kaviar/core";

/**
 * If your input is of "QueryInput" it will automatically apply the filters and options
 * @param collectionClass
 * @param optionsResolver
 */
export function ToNova(
  collectionClass: Constructor<Collection<any>>,
  optionsResolver?: (_, args, ctx, ast) => Promise<IAstToQueryOptions>
) {
  if (!optionsResolver) {
    optionsResolver = defaultNovaOptionsResolver;
  }

  return async function (_, args, ctx, ast) {
    const options = await optionsResolver(_, args, ctx, ast);

    const collection = ctx.container.get(collectionClass);

    return collection.queryGraphQL(ast, options);
  };
}

export function ToNovaOne(
  collectionClass: Constructor<Collection<any>>,
  optionsResolver?: (_, args, ctx, ast) => Promise<IAstToQueryOptions>
) {
  if (!optionsResolver) {
    optionsResolver = defaultNovaOptionsResolver;
  }

  return async function (_, args, ctx, ast) {
    const options = await optionsResolver(_, args, ctx, ast);
    const collection = ctx.container.get(collectionClass);

    return collection.queryOneGraphQL(ast, options);
  };
}

export function ToNovaByResultID(
  collectionClass: Constructor<Collection<any>>,
  optionsResolver?: (_, args, ctx, ast) => Promise<IAstToQueryOptions>
) {
  if (!optionsResolver) {
    optionsResolver = async (_, args, ctx, ast) => {
      const graphqlOptions = {
        filters: {
          _id: getResult(ctx),
        },
      };

      return graphqlOptions;
    };
  }
  return async function (_, args, ctx, ast) {
    const collection = ctx.container.get(collectionClass);

    return collection.queryOneGraphQL(
      ast,
      await optionsResolver(_, args, ctx, ast)
    );
  };
}

const defaultNovaOptionsResolver = async (_, args) => ({
  filters: args.query?.filters || {},
  options: args.query?.options || {},
});

export function ToCollectionCount(
  collectionClass: Constructor<Collection<any>>,
  filterResolver?: (_, args, ctx, ast) => Promise<any>
) {
  if (!filterResolver) {
    filterResolver = async (_, args) => args.filters || {};
  }

  return async function (_, args, ctx, ast) {
    const filters = await filterResolver(_, args, ctx, ast);
    const collection = ctx.container.get(collectionClass);

    return collection.find(filters).count();
  };
}

export function CheckDocumentExists(
  collectionClass: Constructor<Collection<any>>,
  idResolver?: (args: any) => any
) {
  if (!idResolver) {
    idResolver = (args) => args._id;
  }

  return async function (_, args, ctx, ast) {
    const collection = ctx.container.get(collectionClass);

    const document = await collection.findOne(
      { _id: idResolver(args) },
      { projection: { _id: 1 } }
    );

    if (!document) {
      throw new DocumentNotFoundException();
    }
  };
}

export function ToDocumentInsert(
  collectionClass: Constructor<Collection<any>>,
  field: string = "document"
) {
  return async function (_, args, ctx, ast) {
    const collection = ctx.container.get(collectionClass);
    const document = await collection.insertOne(args[field]);

    return document.insertedId;
  };
}

/**
 * @param collectionClass
 * @param idArgumentResolver How to get the _id based on the arguments?
 * @param mutateResolver This should return the update query. {$set: something}
 */
export function ToDocumentUpdateByID(
  collectionClass: Constructor<Collection<any>>,
  idArgumentResolver?: (args) => any,
  mutateResolver?: (args) => any
) {
  if (!idArgumentResolver) {
    idArgumentResolver = (args) => args._id;
  }
  if (!mutateResolver) {
    mutateResolver = (args) => {
      return {
        $set: args.dataSet,
      };
    };
  }

  return async function (_, args, ctx, ast) {
    const collection = ctx.container.get(collectionClass);
    const _id = idArgumentResolver(args);

    await collection.updateOne({ _id }, mutateResolver(args));

    return _id;
  };
}

export function ToDocumentDeleteByID(
  collectionClass: Constructor<Collection<any>>,
  idArgumentResolver?: (args) => any
) {
  if (!idArgumentResolver) {
    idArgumentResolver = (args) => args._id;
  }

  return async function (_, args, ctx, ast) {
    const collection: Collection<any> = ctx.container.get(collectionClass);
    const _id = idArgumentResolver(args);

    await collection.deleteOne({ _id });

    return true;
  };
}
