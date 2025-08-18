import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { AuthUser, UserRole, AgeGroup } from "@/types/user";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: UserRole, ageGroup?: AgeGroup, childName?: string, schoolName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            name: userData.name,
            role: userData.role,
            ageGroup: userData.ageGroup,
            childName: userData.childName,
            firebaseUid: firebaseUser.uid,
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // For demo purposes, simulate sign in
      const mockUser: AuthUser = {
        id: "demo-user-id",
        email,
        name: "Demo User", 
        role: "student",
        ageGroup: "6-11",
        firebaseUid: "demo-firebase-uid",
      };
      setUser(mockUser);
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      // For demo, create a mock Google user
      const mockUser: AuthUser = {
        id: "google-demo-user-id",
        email: "demo@gmail.com",
        name: "Google Demo User",
        role: "student", 
        ageGroup: "6-11",
        firebaseUid: "google-demo-firebase-uid",
      };
      setUser(mockUser);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    name: string, 
    role: UserRole, 
    ageGroup?: AgeGroup, 
    childName?: string,
    schoolName?: string
  ) => {
    // For demo purposes, simulate sign up
    const mockUser: AuthUser = {
      id: "demo-user-id",
      email,
      name,
      role,
      ageGroup,
      childName,
      schoolName,
      firebaseUid: "demo-firebase-uid",
    };
    setUser(mockUser);
  };

  const signOut = async () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
