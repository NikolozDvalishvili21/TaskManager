import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { TeamMember } from "../../types";

const usersRef = collection(db, "users");

export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export async function saveUser(user: UserData): Promise<void> {
  const userDoc = doc(db, "users", user.uid);
  await setDoc(
    userDoc,
    {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || "Anonymous",
      photoURL: user.photoURL || null,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
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
    };
  });

  return users.sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export function subscribeToAllUsers(
  callback: (users: TeamMember[]) => void
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
      });
    });

    // Convert to array and sort by displayName
    const users = Array.from(usersMap.values()).sort((a, b) =>
      a.displayName.localeCompare(b.displayName)
    );

    callback(users);
  });
}
