import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  Unsubscribe,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Comment } from "../../types";

const getCommentsRef = (userId: string, taskId: string) =>
  collection(db, "users", userId, "tasks", taskId, "comments");

function convertTimestamp(timestamp: Timestamp | null): string {
  if (!timestamp) return new Date().toISOString();
  return timestamp.toDate().toISOString();
}

export async function getComments(
  userId: string,
  taskId: string,
): Promise<Comment[]> {
  const commentsRef = getCommentsRef(userId, taskId);
  const q = query(commentsRef, orderBy("createdAt", "asc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      text: data.text,
      authorName: data.authorName,
      authorPhoto: data.authorPhoto,
      authorId: data.authorId,
      createdAt: convertTimestamp(data.createdAt),
    };
  });
}

export function subscribeToComments(
  userId: string,
  taskId: string,
  callback: (comments: Comment[]) => void,
): Unsubscribe {
  const commentsRef = getCommentsRef(userId, taskId);
  const q = query(commentsRef, orderBy("createdAt", "asc"));

  return onSnapshot(q, (snapshot) => {
    const comments = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        text: data.text,
        authorName: data.authorName,
        authorPhoto: data.authorPhoto,
        authorId: data.authorId,
        createdAt: convertTimestamp(data.createdAt),
      };
    });
    callback(comments);
  });
}

export interface CreateCommentData {
  text: string;
  authorName: string;
  authorPhoto: string;
  authorId: string;
}

export async function createComment(
  userId: string,
  taskId: string,
  data: CreateCommentData,
): Promise<string> {
  const commentsRef = getCommentsRef(userId, taskId);
  const docRef = await addDoc(commentsRef, {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function deleteComment(
  userId: string,
  taskId: string,
  commentId: string,
): Promise<void> {
  const commentRef = doc(
    db,
    "users",
    userId,
    "tasks",
    taskId,
    "comments",
    commentId,
  );
  await deleteDoc(commentRef);
}
