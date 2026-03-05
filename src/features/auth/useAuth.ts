import { useEffect } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../../lib/firebase";
import { useAuthStore } from "./authStore";
import { saveUser } from "../users/userService";

export function useAuth() {
  const { user, isLoading, setUser, setLoading, setRole } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        };

        // Save user to Firestore and get their role
        try {
          const role = await saveUser(userData);
          setUser({ ...userData, role });
        } catch (error) {
          console.error("Failed to save user to Firestore:", error);
          // Set default viewer role if save fails
          setUser({ ...userData, role: "viewer" });
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [setUser]);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signInWithGoogle,
    logout,
    setRole,
  };
}
