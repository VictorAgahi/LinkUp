import * as React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Text } from '~/components/ui/text';
import { NAV_THEME } from '~/lib/constants';
import { useColorScheme } from "~/lib/useColorScheme";
import { useAuth } from '~/lib/auth/authContext';
import { getToken } from "~/lib/store/secureStore";
import { useQuery } from '@tanstack/react-query';

export default function HomeScreen() {
    const { isDarkColorScheme } = useColorScheme();
    const { isAuthenticated } = useAuth();

    const currentTheme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light;

    const fetchUserInfo = async () => {
        const token = await getToken("accessToken");
        if (!token) {
            throw new Error("No access token found");
        }
        let URL = process.env.BACKEND_URL || "http://localhost:3000";
        const response = await fetch(`${URL}/user/info`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        return response.json();
    };

    const { data: userInfo, isLoading, isError, error } = useQuery({
        queryKey: ['userInfo'],
        queryFn: fetchUserInfo,
        enabled: !!isAuthenticated,
        retry: 1,
        staleTime: Infinity,
    });

    return (
        <View
            className="flex-1 justify-center items-center p-4"
            style={{ backgroundColor: currentTheme.background }}
        >
            {isLoading ? (
                <ActivityIndicator size="large" color={currentTheme.primary} />
            ) : isError ? (
                <Text className="text-3xl font-bold text-center" style={{ color: currentTheme.primary }}>
                    Error: {(error as Error).message}
                </Text>
            ) : isAuthenticated && userInfo ? (
                <>
                    <Text className="text-3xl font-bold text-center" style={{ color: currentTheme.primary }}>
                        Welcome {userInfo.firstName} {userInfo.lastName} to LinkUp!
                    </Text>
                    <Text className="text-lg text-center mt-2" style={{ color: currentTheme.text }}>
                        The best platform to connect with professionals and job seekers.
                    </Text>
                </>
            ) : (
                <Text className="text-3xl font-bold text-center" style={{ color: currentTheme.primary }}>
                    You are not logged in. Please log in to continue.
                </Text>
            )}
        </View>
    );
}