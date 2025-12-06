'use client';

import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { doc } from 'firebase/firestore';

import type { UserProfile } from '@/lib/types';
import { useAuth, useFirestore, useMemoFirebase } from '../provider';
import { useDoc } from '../firestore/use-doc';

interface UseUserReturn {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: Error | null;
}

export function useUser(): UseUserReturn {
  const auth = useAuth();
  const firestore = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoadingUser(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user);
        setLoadingUser(false);
      },
      (error) => {
        setError(error);
        setLoadingUser(false);
      }
    );
    return () => unsubscribe();
  }, [auth]);

  const userDocRef = useMemoFirebase(() => {
      if (firestore && user) {
        return doc(firestore, 'users', user.uid);
      }
      return null;
    }, [firestore, user]);
    
  const {
    data: profile,
    isLoading: loadingProfile,
    error: profileError,
  } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    if (profileError) {
      setError(profileError);
    }
  }, [profileError]);

  return {
    user,
    profile,
    loading: loadingUser || loadingProfile,
    error,
  };
}
