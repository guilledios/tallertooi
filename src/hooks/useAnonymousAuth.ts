import { onAuthStateChanged, signInAnonymously, type User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../firebase/config";

export function useAnonymousAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          setUser(currentUser);
          setLoading(false);
          return;
        }

        const credential = await signInAnonymously(auth);
        setUser(credential.user);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "No se pudo iniciar sesión anónima.");
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  return { user, loading, error };
}
