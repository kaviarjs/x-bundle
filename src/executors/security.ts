import { Constructor } from "@kaviar/core";
import { PermissionSearchFilter } from "@kaviar/security-bundle";
import {
  UserNotAuthorizedException,
  PermissionService,
} from "@kaviar/security-bundle";

export function CheckLoggedIn() {
  return async function (_, args, ctx, ast) {
    if (!ctx.userId) {
      throw new UserNotAuthorizedException();
    }
  };
}

export type PermissionResolver = (
  _,
  args,
  ctx,
  ast
) => Promise<PermissionSearchFilter>;

export function CheckPermission(
  permissions: string | string[] | PermissionResolver
) {
  return async function (_, args, ctx, ast) {
    const permissionService: PermissionService = ctx.container.get(
      PermissionService
    );

    let search;

    if (typeof permissions === "function") {
      search = await permissions(_, args, ctx, ast);
    } else {
      search = {
        permissions,
      };
    }

    if (!search.userId) {
      search.userId = ctx.userId;
    }

    const hasPermissions = permissionService.has(search);

    if (!hasPermissions) {
      throw new UserNotAuthorizedException();
    }
  };
}
