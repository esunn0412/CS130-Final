import { auth } from "@/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
  Unsubscribe,
} from "firebase/auth";
import { createContext, useContext, useState, useEffect } from "react";
import { db } from "@/firebaseConfig";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { Role, UserDoc } from "@/types/db";

type AuthContextType = {
  user: User | null;
  role: Role | null;
  loading: boolean;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>("participant");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let unsubscribeSnapshot : Unsubscribe | null = null; 

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setLoading(true);
      // console.log(
      //   "auth state on authstatechange:",
      //   firebaseUser?.email ?? "null",
      // );
      if (firebaseUser) {
        unsubscribeSnapshot = onSnapshot(doc(db, "users", firebaseUser.uid), (snap) => {
          if (snap.exists()) {
            const data = snap.data() as UserDoc;
            setRole(data.role ?? "participant");
          }
        });
        // console.log(firebaseUser);
        setUser(firebaseUser);
      } else {
        unsubscribeSnapshot?.()
        unsubscribeSnapshot = null;
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function signUp(name: string, email: string, password: string) {
    let newUser: User | null = null;
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      newUser = cred.user;
      const newUserDoc: UserDoc = {
        name: name,
        email: newUser.email ?? "",
        role: "participant",
        score: 0,
        checkedIn: false,
      }

      await setDoc(doc(db, "users", newUser.uid), newUserDoc);
    } catch (e) {
      if (newUser) {
        await newUser.delete();
      }

      throw e;
    }
  }

  async function signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signOut() {
    await firebaseSignOut(auth);
  }

  return (
    <AuthContext.Provider
      value={{ user, role, loading, signUp, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("user is not authorized");

  return ctx;
}
