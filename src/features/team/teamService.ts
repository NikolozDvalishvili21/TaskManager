import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  Unsubscribe,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { TeamMember } from "../../types";

const getTeamRef = (userId: string) => collection(db, "users", userId, "team");

const getTeamMemberDocRef = (userId: string, memberId: string) =>
  doc(db, "users", userId, "team", memberId);

export function subscribeToTeamMembers(
  userId: string,
  callback: (members: TeamMember[]) => void,
): Unsubscribe {
  const teamRef = getTeamRef(userId);
  const q = query(teamRef, orderBy("displayName", "asc"));

  return onSnapshot(q, (snapshot) => {
    const members = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        uid: doc.id,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL || null,
      };
    });
    callback(members);
  });
}

export async function getTeamMembers(userId: string): Promise<TeamMember[]> {
  const teamRef = getTeamRef(userId);
  const q = query(teamRef, orderBy("displayName", "asc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      uid: doc.id,
      email: data.email,
      displayName: data.displayName,
      photoURL: data.photoURL || null,
    };
  });
}

export interface AddTeamMemberData {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
}

export async function addTeamMember(
  userId: string,
  member: AddTeamMemberData,
): Promise<void> {
  const memberRef = getTeamMemberDocRef(userId, member.uid);
  await setDoc(memberRef, {
    email: member.email,
    displayName: member.displayName,
    photoURL: member.photoURL || null,
    addedAt: serverTimestamp(),
  });
}

export async function removeTeamMember(
  userId: string,
  memberId: string,
): Promise<void> {
  const memberRef = getTeamMemberDocRef(userId, memberId);
  await deleteDoc(memberRef);
}
