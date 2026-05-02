"use client";

import { API_BASE_URL } from "@/constants/auth";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { RegistrationBody } from "server/types/authApi";
import { useSecureStorage } from "@/hooks/useSecureStorage";
import { useServiceError } from "@/hooks/useServiceError";
import { useRouter } from "next/navigation";
import { disconnectSocket } from "@/lib/socket";

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
    const handleServiceError = useServiceError();
    const router = useRouter();

    const handleNavigate = useCallback((path: string) => {
        router.push(path);
    }, [router]);

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

                    // Initialize Push Notifications with navigation callback
                    import("@/lib/pushNotifications").then(({ PushNotificationService }) => {
                        PushNotificationService.initialize(parsedUser.userId, handleNavigate);
                    });
                }
            } catch (error) {
                // ignore parse errors, but catch network/service errors if logic needs it
                if (error instanceof TypeError && error.message === "Failed to fetch") {
                   handleServiceError(error);
                }
            } finally {
                setLoading(false);
            }
        };
        rehydrate();
    }, [getItem]);

    const login = async (email: string, password: string) => {
        try {
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
            
            // Initialize Push Notifications with navigation callback
            const { PushNotificationService } = await import("@/lib/pushNotifications");
            await PushNotificationService.initialize(authUser.userId, handleNavigate);

            return authUser;
        } catch (error) {
            if (error instanceof TypeError && error.message === "Failed to fetch") {
                handleServiceError(error);
            }
            throw error;
        }
    };

    const register = async (formData: RegistrationBody) => {
        try {
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
        } catch (error) {
            if (error instanceof TypeError && error.message === "Failed to fetch") {
                handleServiceError(error);
            }
            throw error;
        }
    };

    const logout = async () => {
        disconnectSocket();
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
