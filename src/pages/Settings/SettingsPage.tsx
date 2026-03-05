import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useAuthStore } from "../../features/auth/authStore";
import { useThemeStore } from "../../features/board/themeStore";
import { useUIStore } from "../../features/board/uiStore";
import { usePermissions } from "../../features/roles/usePermissions";
import {
  subscribeToAllUsers,
  updateUserRole,
} from "../../features/users/userService";
import { Avatar, Button } from "../../components";
import { classNames } from "../../lib/utils";
import { TeamMember, UserRole, ROLE_LABELS } from "../../types";
import styles from "./SettingsPage.module.css";

export function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const { theme, setTheme } = useThemeStore();
  const addToast = useUIStore((state) => state.addToast);
  const { canManageRoles, role: currentUserRole } = usePermissions();
  const setRole = useAuthStore((state) => state.setRole);

  const [allUsers, setAllUsers] = useState<TeamMember[]>([]);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [hasNoAdmin, setHasNoAdmin] = useState(false);
  const [claimingAdmin, setClaimingAdmin] = useState(false);

  // Always subscribe to users to check if there's an admin
  useEffect(() => {
    const unsubscribe = subscribeToAllUsers((users) => {
      setAllUsers(users);
      // Check if there are no admins
      const adminExists = users.some((u) => u.role === "admin");
      setHasNoAdmin(!adminExists);
    });
    return () => unsubscribe();
  }, []);

  const handleClaimAdmin = async () => {
    if (!user) return;
    setClaimingAdmin(true);
    try {
      await updateUserRole(user.uid, "admin");
      setRole("admin");
      addToast("You are now an Admin!", "success");
    } catch (error) {
      console.error("Failed to claim admin:", error);
      addToast("Failed to claim admin role", "error");
    } finally {
      setClaimingAdmin(false);
    }
  };

  const handleRoleChange = async (uid: string, newRole: UserRole) => {
    setUpdatingRole(uid);
    try {
      await updateUserRole(uid, newRole);
      addToast("Role updated successfully", "success");
    } catch (error) {
      console.error("Failed to update role:", error);
      addToast("Failed to update role", "error");
    } finally {
      setUpdatingRole(null);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      addToast("Failed to sign out", "error");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Manage your account preferences</p>
      </div>

      <div className={styles.sections}>
        {/* Profile Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Profile</h2>
          <p className={styles.sectionDescription}>Your account information</p>

          <div className={styles.settingRow}>
            <div className={styles.userProfile}>
              <Avatar src={user?.photoURL} name={user?.displayName} size="xl" />
              <div className={styles.userDetails}>
                <div className={styles.userName}>
                  {user?.displayName || "User"}
                </div>
                <div className={styles.userEmail}>{user?.email}</div>
                <div className={styles.userRole}>
                  Role: {ROLE_LABELS[currentUserRole]}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Claim Admin - Only shown when no admin exists */}
        {hasNoAdmin && currentUserRole !== "admin" && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Claim Admin Role</h2>
            <p className={styles.sectionDescription}>
              No admin exists. Claim admin role to manage users.
            </p>
            <Button onClick={handleClaimAdmin} isLoading={claimingAdmin}>
              Become Admin
            </Button>
          </div>
        )}

        {/* Appearance Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Appearance</h2>
          <p className={styles.sectionDescription}>
            Customize how TaskFlow looks
          </p>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <div className={styles.settingLabel}>Theme</div>
              <div className={styles.settingHint}>
                Choose between light and dark mode
              </div>
            </div>
            <div className={styles.themeToggle}>
              <button
                className={classNames(
                  styles.themeOption,
                  theme === "light" && styles.themeOptionActive,
                )}
                onClick={() => setTheme("light")}
                aria-label="Light theme"
              >
                <svg
                  className={styles.themeIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              </button>
              <button
                className={classNames(
                  styles.themeOption,
                  theme === "dark" && styles.themeOptionActive,
                )}
                onClick={() => setTheme("dark")}
                aria-label="Dark theme"
              >
                <svg
                  className={styles.themeIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* User Management Section - Admin Only */}
        {canManageRoles && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>User Management</h2>
            <p className={styles.sectionDescription}>
              Manage user roles and permissions
            </p>

            <div className={styles.userList}>
              {allUsers.map((member) => (
                <div key={member.uid} className={styles.userRow}>
                  <div className={styles.userInfo}>
                    <Avatar
                      src={member.photoURL}
                      name={member.displayName}
                      size="sm"
                    />
                    <div className={styles.userMeta}>
                      <span className={styles.memberName}>
                        {member.displayName}
                      </span>
                      <span className={styles.memberEmail}>{member.email}</span>
                    </div>
                  </div>
                  <select
                    className={styles.roleSelect}
                    value={member.role || "viewer"}
                    onChange={(e) =>
                      handleRoleChange(member.uid, e.target.value as UserRole)
                    }
                    disabled={
                      updatingRole === member.uid || member.uid === user?.uid
                    }
                  >
                    <option value="admin">Admin</option>
                    <option value="pm">Project Manager</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Account Section */}
        <div className={classNames(styles.section, styles.dangerZone)}>
          <h2 className={styles.sectionTitle}>Account</h2>
          <p className={styles.sectionDescription}>Manage your account</p>

          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <div className={styles.settingLabel}>Sign out</div>
              <div className={styles.settingHint}>
                Sign out of your account on this device
              </div>
            </div>
            <Button variant="danger" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
