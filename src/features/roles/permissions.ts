import { UserRole } from "../../types";

export type Permission =
  | "task:create"
  | "task:edit"
  | "task:delete"
  | "task:assign"
  | "task:move"
  | "comment:create"
  | "comment:delete"
  | "user:manage_roles";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    "task:create",
    "task:edit",
    "task:delete",
    "task:assign",
    "task:move",
    "comment:create",
    "comment:delete",
    "user:manage_roles",
  ],
  pm: [
    "task:create",
    "task:edit",
    "task:delete",
    "task:assign",
    "task:move",
    "comment:create",
    "comment:delete",
  ],
  viewer: ["task:move", "comment:create"],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function canManageRoles(role: UserRole): boolean {
  return hasPermission(role, "user:manage_roles");
}

export function canCreateTask(role: UserRole): boolean {
  return hasPermission(role, "task:create");
}

export function canEditTask(role: UserRole): boolean {
  return hasPermission(role, "task:edit");
}

export function canDeleteTask(role: UserRole): boolean {
  return hasPermission(role, "task:delete");
}

export function canAssignTask(role: UserRole): boolean {
  return hasPermission(role, "task:assign");
}

export function canMoveTask(role: UserRole): boolean {
  return hasPermission(role, "task:move");
}

export function canCreateComment(role: UserRole): boolean {
  return hasPermission(role, "comment:create");
}

export function canDeleteComment(role: UserRole): boolean {
  return hasPermission(role, "comment:delete");
}
