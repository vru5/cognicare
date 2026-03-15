"use client";

import { API_BASE_URL } from "@/constants/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { RegistrationBody } from "server/types/authApi";
import { useSecureStorage } from "@/hooks/useSecureStorage";

const AUTH_STORAGE_KEY = "cognicare_auth";

export interface AuthUser {
    userId: string;
    profileId: string | null;
    role: string | null;
    name: string | null;
    isCarer: boolean;
}

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<AuthUser>;
    register: (formData: RegistrationBody) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: async () => { throw new Error("Not implemented"); },
    register: async () => { },
    logout: () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const { setItem, getItem, removeItem } = useSecureStorage();

    // Rehydrate from secure storage on mount
    useEffect(() => {
        const rehydrate = async () => {
            try {
                const stored = await getItem(AUTH_STORAGE_KEY);
                if (stored) {
                    const parsedUser = JSON.parse(stored) as AuthUser;
                    // Ensure isCarer is correctly set even if rehydrating from an old version of the object
                    if (parsedUser && typeof parsedUser.isCarer === "undefined") {
                        parsedUser.isCarer = parsedUser.role === "CARER";
                    }
                    setUser(parsedUser);
                }
            } catch {
                // ignore parse errors
            } finally {
                setLoading(false);
            }
        };
        rehydrate();
    }, [getItem]);

    const login = async (email: string, password: string) => {
        const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.error || "Login failed");
        }

        const authUser: AuthUser = {
            userId: data.userId,
            profileId: data.profileId,
            role: data.role,
            name: data.name,
            isCarer: data.role === "CARER",
        };

        await setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
        setUser(authUser);
        return authUser;
    };

    const register = async (formData: RegistrationBody) => {
        const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Registration failed");
        }
    };

    const logout = async () => {
        await removeItem(AUTH_STORAGE_KEY);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
