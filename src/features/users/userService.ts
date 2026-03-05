import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  onSnapshot,
  query,
  where,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { TeamMember, UserRole } from "../../types";

const usersRef = collection(db, "users");

export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role?: UserRole;
}

async function hasAnyAdmin(): Promise<boolean> {
  const q = query(usersRef, where("role", "==", "admin"));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

export async function saveUser(user: UserData): Promise<UserRole> {
  const userDoc = doc(db, "users", user.uid);

  // Check if user already exists to preserve their role
  const existingDoc = await getDoc(userDoc);
  const existingRole = existingDoc.exists() ? existingDoc.data().role : null;

  let role: UserRole;
  if (existingRole) {
    role = existingRole;
  } else {
    // New user - check if there are any admins
    const hasAdmin = await hasAnyAdmin();
    // First user becomes admin, others become viewers
    role = hasAdmin ? "viewer" : "admin";
  }

  await setDoc(
    userDoc,
    {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || "Anonymous",
      photoURL: user.photoURL || null,
      role,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );

  return role;
}

export async function getAllUsers(): Promise<TeamMember[]> {
  const snapshot = await getDocs(usersRef);

  const users = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      uid: doc.id,
      email: data.email || "",
      displayName: data.displayName || "Anonymous",
      photoURL: data.photoURL || null,
      role: data.role || "viewer",
    };
  });

  return users.sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export function subscribeToAllUsers(
  callback: (users: TeamMember[]) => void,
): Unsubscribe {
  return onSnapshot(usersRef, (snapshot) => {
    const usersMap = new Map<string, TeamMember>();

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      // Use Map to ensure no duplicates by uid
      usersMap.set(doc.id, {
        uid: doc.id,
        email: data.email || "",
        displayName: data.displayName || "Anonymous",
        photoURL: data.photoURL || null,
        role: data.role || "viewer",
      });
    });

    // Convert to array and sort by displayName
    const users = Array.from(usersMap.values()).sort((a, b) =>
      a.displayName.localeCompare(b.displayName),
    );

    callback(users);
  });
}

export async function updateUserRole(
  uid: string,
  role: UserRole,
): Promise<void> {
  const userDoc = doc(db, "users", uid);
  await updateDoc(userDoc, { role });
}

export async function getUserRole(uid: string): Promise<UserRole> {
  const userDoc = doc(db, "users", uid);
  const docSnap = await getDoc(userDoc);
  if (docSnap.exists()) {
    return docSnap.data().role || "viewer";
  }
  return "viewer";
}
