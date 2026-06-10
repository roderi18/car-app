import { auth, db, isFirebaseConfigured } from '@/config/firebase';
import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

type UserProfile = {
  uid: string;
  displayName: string;
  email: string;
  phone?: string;
  photoURL?: string;
  role: 'driver' | 'workshop_owner' | 'admin';
  mainVehicleId?: string | null;
};

type SignUpInput = {
  email: string;
  password: string;
  displayName?: string;
};

type UpdateProfileInput = {
  displayName?: string;
  phone?: string;
  photoURL?: string;
};

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  initializing: boolean;
  isConfigured: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signup: (input: SignUpInput) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  updateUserProfile: (input: UpdateProfileInput) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const missingConfigMessage =
  'Firebase no esta configurado. Copia .env.example a .env y completa las variables EXPO_PUBLIC_FIREBASE_*.';

const assertFirebase = () => {
  if (!isFirebaseConfigured || !auth || !db) {
    throw new Error(missingConfigMessage);
  }
};

const buildProfile = (user: User, displayName?: string): UserProfile => ({
  uid: user.uid,
  displayName: displayName || user.displayName || '',
  email: user.email || '',
  phone: user.phoneNumber || '',
  photoURL: user.photoURL || '',
  role: 'driver',
  mainVehicleId: null,
});

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    if (!auth || !db) {
      setInitializing(false);
      return;
    }

    const currentDb = db;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setProfile(null);
        setInitializing(false);
        return;
      }

      const profileRef = doc(currentDb, 'users', currentUser.uid);
      const snapshot = await getDoc(profileRef);

      if (snapshot.exists()) {
        setProfile(snapshot.data() as UserProfile);
      } else {
        const newProfile = buildProfile(currentUser);
        await setDoc(profileRef, {
          ...newProfile,
          countryCode: 'DO',
          notificationPrefs: {
            fuel: true,
            appointments: true,
            maintenance: true,
            promotions: false,
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setProfile(newProfile);
      }

      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      initializing,
      isConfigured: isFirebaseConfigured,
      login: async (email, password, rememberMe = false) => {
        assertFirebase();
        if (Platform.OS === 'web') {
          await setPersistence(auth!, rememberMe ? browserLocalPersistence : browserSessionPersistence);
        }
        await signInWithEmailAndPassword(auth!, email.trim(), password);
      },
      signup: async ({ email, password, displayName }) => {
        assertFirebase();
        const credentials = await createUserWithEmailAndPassword(auth!, email.trim(), password);

        if (displayName) {
          await updateProfile(credentials.user, { displayName });
        }

        const userProfile = buildProfile(credentials.user, displayName);
        await setDoc(doc(db!, 'users', credentials.user.uid), {
          ...userProfile,
          countryCode: 'DO',
          notificationPrefs: {
            fuel: true,
            appointments: true,
            maintenance: true,
            promotions: false,
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setProfile(userProfile);
      },
      forgotPassword: async (email) => {
        assertFirebase();
        await sendPasswordResetEmail(auth!, email.trim());
      },
      updateUserProfile: async ({ displayName, phone, photoURL }) => {
        assertFirebase();
        if (!auth!.currentUser) {
          throw new Error('No hay una sesion activa.');
        }

        const cleanUpdate = {
          ...(displayName !== undefined ? { displayName } : {}),
          ...(phone !== undefined ? { phone } : {}),
          ...(photoURL !== undefined ? { photoURL } : {}),
          updatedAt: serverTimestamp(),
        };

        if (displayName || photoURL) {
          await updateProfile(auth!.currentUser, { displayName, photoURL });
        }

        await updateDoc(doc(db!, 'users', auth!.currentUser.uid), cleanUpdate);
        setProfile((current) => (current ? { ...current, ...cleanUpdate } as UserProfile : current));
      },
      logout: async () => {
        assertFirebase();
        await signOut(auth!);
      },
    }),
    [initializing, profile, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider.');
  }
  return context;
};
