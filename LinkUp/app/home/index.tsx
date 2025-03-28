import * as React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Text } from '~/components/ui/text';
import { NAV_THEME } from '~/lib/constants';
import { useColorScheme } from "~/lib/useColorScheme";
import { useAuth } from '~/lib/auth/authContext';
import { useEffect, useState } from "react";
import { getToken } from "~/lib/store/secureStore";  // Import de getToken

export default function HomeScreen() {
    const { isDarkColorScheme } = useColorScheme();
    const { isAuthenticated } = useAuth();
    const [userInfo, setUserInfo] = useState<{ firstName: string, lastName: string } | null>(null);
    const [loading, setLoading] = useState(true);

    const currentTheme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light;

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const token = await getToken("accessToken");
                if (!token) {
                    console.warn("No access token found");
                    setLoading(false);
                    return;
                }

                let URL = process.env.BACKEND_URL;
                if (URL == undefined)
                {
                    URL = "http://localhost:3000"
                }


                const response = await fetch( URL + "/user/info", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP Error: ${response.status}`);
                }

                const data = await response.json();
                setUserInfo(data);
            } catch (error) {
                console.error("Error fetching user info:", error);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchUserInfo();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated]);

    return (
        <View
            className="flex-1 justify-center items-center p-4"
            style={{ backgroundColor: currentTheme.background }}
        >
            {loading ? (
                <ActivityIndicator size="large" color={currentTheme.primary} />
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
