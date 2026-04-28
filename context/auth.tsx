import { auth, db } from "@/firebaseConfig";
import { Role, UserDoc } from "@/types/db";
import {
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  User,
} from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  user: User | null;
  role: Role | null;
  loading: boolean;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

function buildUserQrCode(uid: string) {
  // UID + timestamp creates a stable unique payload for each signup.
  return `user:${uid}:${Date.now()}`;
}

function buildDefaultUserDoc(uid: string, email: string): UserDoc {
  return {
    email,
    role: "participant",
    score: 0,
    checkedIn: false,
    qrCode: buildUserQrCode(uid),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>("participant");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let unsubscribeUserDoc: (() => void) | null = null;
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setLoading(true);
      console.log(
        "auth state on authstatechange:",
        firebaseUser?.email ?? "null",
      );
      if (firebaseUser) {
        const userRef = doc(db, "users", firebaseUser.uid);
        unsubscribeUserDoc = onSnapshot(
          userRef,
          async (snap) => {
            if (snap.exists()) {
              const data = snap.data() as UserDoc;
              setRole(data.role ?? "participant");
              return;
            }

            // Backfill legacy or failed-write accounts so downstream views can rely on this doc.
            await setDoc(
              userRef,
              buildDefaultUserDoc(firebaseUser.uid, firebaseUser.email ?? ""),
              { merge: true },
            );
            setRole("participant");
          },
          (error) => {
            console.error("Failed to read users document:", error);
          },
        );
        // console.log("user is signed in")
        console.log(firebaseUser);
        setUser(firebaseUser);
      } else {
        // console.log("user is signed out")
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return () => {
      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
      }
      unsubscribe();
    };
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
      };

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
