import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as fbSignOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { ref, set, get, child } from 'firebase/database';
import { auth, database } from '../lib/firebase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(localStorage.getItem('selected_role') || null);
    const [configError, setConfigError] = useState(null);

    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // Ensure id field is available for components expecting user.id
                currentUser.id = currentUser.uid;
                setUser(currentUser);
                await fetchUserRole(currentUser.uid);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const fetchUserRole = async (userId) => {
        try {
            if (database) {
                const dbRef = ref(database);
                const snapshot = await get(child(dbRef, `users/${userId}/role`));
                if (snapshot.exists()) {
                    const role = snapshot.val();
                    setUserRole(role);
                    localStorage.setItem('selected_role', role);
                    return role;
                }
            }
        } catch (err) {
            console.warn('Firebase role fetch notice:', err);
        }
        const cached = localStorage.getItem('selected_role');
        if (cached) {
            setUserRole(cached);
            return cached;
        }
        return null;
    };

    const signUp = async (email, password, metadata = {}) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;
        fbUser.id = fbUser.uid;

        if (metadata.full_name) {
            try {
                await updateProfile(fbUser, { displayName: metadata.full_name });
            } catch (e) {
                console.warn('Profile update error:', e);
            }
        }

        if (metadata.role) {
            setUserRole(metadata.role);
            localStorage.setItem('selected_role', metadata.role);
            if (!database) {
                throw new Error('Database is not connected. Farmer details cannot be saved.');
            }
            await set(ref(database, `users/${fbUser.uid}`), {
                username: email.split('@')[0],
                role: metadata.role,
                full_name: metadata.full_name || '',
                phone: metadata.phone || '',
                email,
                createdAt: new Date().toISOString()
            });
        }

        setUser(fbUser);
        return { user: fbUser };
    };

    const signIn = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const fbUser = userCredential.user;
            fbUser.id = fbUser.uid;
            setUser(fbUser);
            const role = await fetchUserRole(fbUser.uid);
            return { user: fbUser, role, error: null };
        } catch (error) {
            const msg = `${error.code || ''} ${error.message || ''}`;
            if (
                msg.includes('auth/invalid-credential') ||
                msg.includes('auth/wrong-password') ||
                msg.includes('auth/user-not-found') ||
                msg.includes('invalid-credential')
            ) {
                error.message = 'Incorrect email or password.';
            }
            return { user: null, error };
        }
    };

    const signOut = async () => {
        try {
            await fbSignOut(auth);
            setUser(null);
            setUserRole(null);
            localStorage.removeItem('selected_role');
        } catch (err) {
            console.error('Sign out error:', err);
        }
    };

    const value = {
        user,
        session: user ? { user } : null,
        userRole,
        loading,
        configError,
        signUp,
        signIn,
        signOut,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
