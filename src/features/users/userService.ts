import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  Unsubscribe,
  query,
  orderBy,
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
  const q = query(usersRef, orderBy("displayName", "asc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      uid: doc.id,
      email: data.email || "",
      displayName: data.displayName || "Anonymous",
      photoURL: data.photoURL || null,
    };
  });
}

export function subscribeToAllUsers(
  callback: (users: TeamMember[]) => void
): Unsubscribe {
  const q = query(usersRef, orderBy("displayName", "asc"));

  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        uid: doc.id,
        email: data.email || "",
        displayName: data.displayName || "Anonymous",
        photoURL: data.photoURL || null,
      };
    });
    callback(users);
  });
}
