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
      // Import Firebase sign-in
      const { signInWithEmailAndPassword: firebaseSignIn } = await import('../lib/firebase');
      await firebaseSignIn(auth, email, password);
      // The auth state change will handle setting the user
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Import Google sign-in from Firebase
      const { signInWithGoogle: firebaseGoogleSignIn, createUserProfile } = await import('../lib/firebase');
      const result = await firebaseGoogleSignIn();
      
      if (result.user) {
        // Create or get user profile
        await createUserProfile(result.user, {
          role: 'student',
          ageGroup: '6-11'
        });
        
        // The auth state change will handle setting the user
      }
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
    try {
      // Import Firebase sign-up
      const { createUserWithEmailAndPassword: firebaseSignUp, createUserProfile } = await import('../lib/firebase');
      const result = await firebaseSignUp(auth, email, password);
      
      if (result.user) {
        // Create user profile in Firestore
        await createUserProfile(result.user, {
          name,
          role,
          ageGroup,
          childName,
          schoolName
        });
        
        // The auth state change will handle setting the user
      }
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
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
