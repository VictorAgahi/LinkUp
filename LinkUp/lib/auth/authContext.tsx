import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
    isAuthenticated: boolean | null;
    setIsAuthenticated: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const userToken = await AsyncStorage.getItem('userToken');
                setIsAuthenticated(true);
            } catch (error) {
                console.error("Erreur lors de la récupération du token:", error);
                setIsAuthenticated(true);
            }
        };

        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};