# X-Bundle

Because speed. A list of executors meant to ease your life with the:

## ENV File

```typescript
```

## Go

```bash

```

- MongoBundle
- Logger
- Validator
- Apollo Bundle
- Apollo Security
- Security
- Security Mongo
- Executor
- Loader

## Validators

# Unique Field Validator

```typescript
import { Schema, Is, a } from "@kaviar/validator";

@Schema()
class User {
  @Is(
    a.string().uniqueField({
      collection: UsersCollection,
      field: "username",
    })
  )
  username: string;
}
```

# Date Transformer

If the value is a string or number and you want it to automatically cast it.

```typescript
import { Schema, Is, a } from "@kaviar/validator";

@Schema()
class User {
  @Is(a.date().format("DD/MM/YYYY"))
  birthday: Date;
}
```

## Document Executors

- Executors
- ToNovaOne(() => {})
- ToNova
- ToNovaFromResultId
- ToModel
- Validate
- CheckDocumentId(Collection, idResolver);
- CheckLoggedIn
- CheckPermission([Permissions.ADMIN, Permissions.ADD_POST])
- CheckPermission(async (\_, args, ctx) => {
  return {
  permission: Permission.POST_ADD,
  domain: Domains.POSTS,
  domainIdentifier: args.\_id
  }
  })
- LogAction
- ToService<PostService>(PostService, "addPost", ArgumentMapper)
- CollectionInsertOne(Collection, () => {});
<!-- - FromCollection(Collection, () => {}); to respond with the collection element's data? -->
- CollectionUpdateOne(Collection, idResolver, mutateResolver);
- CollectionDeleteOne(Collection, idResolver);
- LogResult
