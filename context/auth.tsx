import { auth } from "@/firebaseConfig"
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut, User } from "firebase/auth"
import { createContext, useContext, useState, useEffect } from "react";

type Role = "Participant" | "Admin"
 
type AuthContextType = {
  user: User | null;
  role: Role | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<Role | null>("Participant")

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // setRole("Participant")
        // console.log("user is signed in")
        console.log(firebaseUser)
      } else {
        // console.log("user is signed out")
        setUser(null);
        setRole(null); 
      }
    })
    return unsubscribe
  }, [])

  async function signUp(email: string, password: string) {
    await createUserWithEmailAndPassword(auth, email, password) 
  };

  async function signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password)
  }

  function signOut() {
    return firebaseSignOut(auth);
  }
    
  return (
    <AuthContext.Provider value={{ user, role, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("user is not authorized");

  return ctx;
}
