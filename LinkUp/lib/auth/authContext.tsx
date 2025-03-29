import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { getToken, saveToken, deleteToken } from '~/lib/store/secureStore';
import { Alert } from 'react-native';
import { BACKEND_URL } from '@env';

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
                console.log('Valid token:', isTokenValid);

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
                        console.log('Token successfully refreshed.');
                    } else {
                        setIsAuthenticated(false);
                        await deleteToken('accessToken');
                        await deleteToken('refreshToken');
                        console.log('Failed to refresh token.');
                    }
                    setIsRefreshing(false);
                } else {
                    setIsAuthenticated(false);
                    console.log('No refreshToken available or verification failed.');
                }

            } catch (error) {
                console.error('Error during authentication check:', error);
                setIsAuthenticated(false);
            }
        };

        checkAuth();
    }, [isRefreshing]);

    const handleRegister = async (form: any) => {
        try {
            console.log('Attempting to register user...');
            let API = BACKEND_URL;
            if (!BACKEND_URL) {
                throw new Error('BACKEND_URL not found in .env');
            }
            const response = await axios.post(API + "/auth/register", form, {
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
            let API = BACKEND_URL;
            if (!BACKEND_URL) {
                throw new Error('BACKEND_URL not found in .env');
            }
            const response = await axios.post(API + "/auth/login", {
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
            Alert.alert('Error', error.response?.data?.message || 'An error occurred.');
        } else {
            console.error('Unknown error:', error);
            Alert.alert('Error', 'An unknown error occurred.');
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
        console.log('Expired token?', !isValid);
        return isValid;
    } catch (error) {
        console.error('Error decoding token:', error);
        return false;
    }
};

const refreshAccessToken = async (refreshToken: string): Promise<string | null> => {
    try {
        console.log('Attempting to refresh access token...');
        let API = BACKEND_URL;
        if (!BACKEND_URL) {
            throw new Error('BACKEND_URL not found in .env');
        }
        const response = await axios.post(API + "/auth/refresh-token", { refreshToken });
        if (response.status === 200) {
            console.log('Access token refreshed');
            return response.data.accessToken;
        }
    } catch (error) {
        console.error('Error refreshing token:', error);
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