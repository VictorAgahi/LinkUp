import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { getToken, saveToken, deleteToken } from '~/lib/store/secureStore';
import { Alert } from 'react-native';

interface AuthContextType {
    isAuthenticated: boolean | null;
    setIsAuthenticated: (value: boolean) => void;
    handleRegister: (form: any) => Promise<void>;
    handleLogout: () => void;
    handleLogin: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const accessToken = await getToken('accessToken');
                const refreshToken = await getToken('refreshToken');

                if (!accessToken) {
                    setIsAuthenticated(false);
                    return;
                }

                const isTokenValid = validateToken(accessToken);
                console.log('Token valide :', isTokenValid);

                if (isTokenValid) {
                    setIsAuthenticated(true);
                    return;
                }
                if (refreshToken && !isRefreshing) {
                    setIsRefreshing(true);
                    const newAccessToken = await refreshAccessToken(refreshToken);
                    if (newAccessToken) {
                        await saveToken('accessToken', newAccessToken);
                        setIsAuthenticated(true);
                        console.log('Token rafraîchi avec succès.');
                    } else {
                        setIsAuthenticated(false);
                        await deleteToken('accessToken');
                        await deleteToken('refreshToken');
                        console.log('Échec du rafraîchissement du token.');
                    }
                    setIsRefreshing(false);
                } else {
                    setIsAuthenticated(false);
                    console.log('Aucun refreshToken disponible ou échec de la vérification.');
                }

            } catch (error) {
                console.error('Erreur lors de la vérification de l\'authentification:', error);
                setIsAuthenticated(false);
            }
        };

        checkAuth();
    }, [isRefreshing]);

    const handleRegister = async (form: any) => {
        try {
            console.log('Attempting to register user...');
            const response = await axios.post('http://localhost:3000/auth/register', form, {
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.status === 201) {
                const { accessToken, refreshToken } = response.data;
                console.log('Registration successful. Tokens received:', { accessToken, refreshToken });
                await saveToken('accessToken', accessToken);
                await saveToken('refreshToken', refreshToken);
                setIsAuthenticated(true);
            }
        } catch (error) {
            handleAxiosError(error);
        }
    };

    const handleLogin = async (email: string, password: string) => {
        try {
            console.log('Attempting to login...');
            const response = await axios.post('http://localhost:3000/auth/login', {
                email,
                password,
            }, {
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.status === 201) {
                const { accessToken, refreshToken } = response.data;
                console.log('Login successful. Tokens received:', { accessToken, refreshToken });
                await saveToken('accessToken', accessToken);
                await saveToken('refreshToken', refreshToken);
                setIsAuthenticated(true);
            }
        } catch (error) {
            handleAxiosError(error);
        }
    };

    const handleLogout = async () => {
        console.log('Logging out...');
        await deleteToken('accessToken');
        await deleteToken('refreshToken');
        setIsAuthenticated(false);
    };

    const handleAxiosError = (error: any) => {
        if (axios.isAxiosError(error)) {
            console.error('Axios error:', error.response?.data || error.message);
            Alert.alert('Erreur', error.response?.data?.message || 'Une erreur est survenue.');
        } else {
            console.error('Unknown error:', error);
            Alert.alert('Erreur', 'Une erreur inconnue est survenue.');
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, handleRegister, handleLogout, handleLogin }}>
            {children}
        </AuthContext.Provider>
    );
};

const validateToken = (token: string): boolean => {
    try {
        const decoded = jwtDecode<{ exp: number }>(token);
        const isValid = decoded.exp * 1000 > Date.now();
        console.log('Token expiré ?', !isValid);
        return isValid;
    } catch (error) {
        console.error('Erreur lors du décodage du token:', error);
        return false;
    }
};

const refreshAccessToken = async (refreshToken: string): Promise<string | null> => {
    try {
        const response = await axios.post('http://localhost:3000/auth/refresh-token', { refreshToken });
        if (response.status === 200) {
            console.log('Token d\'accès renouvelé');
            return response.data.accessToken;
        }
    } catch (error) {
        console.error('Erreur lors du rafraîchissement du token:', error);
        return null;
    }
    return null;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};