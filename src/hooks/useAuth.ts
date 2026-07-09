import { onAuthStateChanged, signInAnonymously, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { useCallback, useEffect, useState } from "react";
import { auth } from "../firebase/config";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
  }, []);

  const signInTeacher = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo iniciar sesión.");
      throw caught;
    }
  }, []);

  const ensureAnonymousStudent = useCallback(async () => {
    if (auth.currentUser) {
      return auth.currentUser;
    }

    try {
      setError(null);
      const credential = await signInAnonymously(auth);
      return credential.user;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo iniciar sesión anónima.");
      throw caught;
    }
  }, []);

  const logOut = useCallback(async () => {
    await signOut(auth);
  }, []);

  return {
    user,
    loading,
    error,
    isTeacher: Boolean(user && !user.isAnonymous),
    signInTeacher,
    ensureAnonymousStudent,
    logOut
  };
}
