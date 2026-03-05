import { useAuthStore } from "../auth/authStore";
import {
  canCreateTask,
  canEditTask,
  canDeleteTask,
  canAssignTask,
  canMoveTask,
  canCreateComment,
  canDeleteComment,
  canManageRoles,
  Permission,
  hasPermission,
} from "./permissions";

export function usePermissions() {
  const user = useAuthStore((state) => state.user);
  const role = user?.role ?? "viewer";

  return {
    role,
    canCreateTask: canCreateTask(role),
    canEditTask: canEditTask(role),
    canDeleteTask: canDeleteTask(role),
    canAssignTask: canAssignTask(role),
    canMoveTask: canMoveTask(role),
    canCreateComment: canCreateComment(role),
    canDeleteComment: canDeleteComment(role),
    canManageRoles: canManageRoles(role),
    hasPermission: (permission: Permission) => hasPermission(role, permission),
    isAdmin: role === "admin",
    isPM: role === "pm",
    isViewer: role === "viewer",
  };
}
