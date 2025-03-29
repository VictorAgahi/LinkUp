import * as React from 'react';
import { View, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { Text } from '~/components/ui/text';
import { NAV_THEME } from '~/lib/constants';
import { useColorScheme } from "~/lib/useColorScheme";
import { useAuth } from '~/lib/auth/authContext';
import { getToken } from "~/lib/store/secureStore";
import { useQuery } from '@tanstack/react-query';
import { useWebsocket } from "~/lib/websockets/WebSocketContext";
import { BACKEND_URL } from "@env";

interface USER
{
    firstName: string;
    lastName: string;
    username: string;
    id: string;
}

const OnlineUserItem = ({ user, theme }: { user: USER; theme: any }) => (
    <TouchableOpacity className="flex-row items-center p-3 my-1 rounded-lg border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: theme.success }} />
        <View>
            <Text className="text-base font-medium" style={{ color: theme.text }}>
                {user.firstName} {user.lastName}
            </Text>
            {user.username && (
                <Text className="text-sm" style={{ color: theme.muted }}>
                    @{user.username}
                </Text>
            )}
        </View>
    </TouchableOpacity>
);

interface UserInfo extends USER {};

export default function HomeScreen() {
    const { isDarkColorScheme } = useColorScheme();
    const { isAuthenticated } = useAuth();
    const { onlineUsers } = useWebsocket();
    const currentTheme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light;

    const fetchUserInfo = async () => {
        const token = await getToken("accessToken");
        if (!token) throw new Error("No access token found");

        const response = await fetch(`${BACKEND_URL}/user/info`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        return response.json();
    };

    const { data: userInfo, isLoading, isError, error } = useQuery({
        queryKey: ['userInfo'],
        queryFn: fetchUserInfo,
        enabled: !!isAuthenticated,
        retry: 1,
        staleTime: Infinity,
    });
    console.log("USER INFO ID : " + userInfo);
    console.log("ONLINE USER : " + onlineUsers);

    return (
        <View className="flex-1 p-4" style={{ backgroundColor: currentTheme.background }}>
            {isLoading ? (
                <ActivityIndicator size="large" color={currentTheme.primary} />
            ) : isError ? (
                <Text className="text-lg font-bold text-center" style={{ color: currentTheme.primary }}>
                    Error: {(error as Error).message}
                </Text>
            ) : isAuthenticated && userInfo ? (
                <>
                    <View className="mb-6 items-center">
                        <Text className="text-xl font-bold text-center" style={{ color: currentTheme.primary }}>
                            Welcome {userInfo.firstName} {userInfo.lastName} to LinkUp!
                        </Text>
                        <Text className="text-base text-center mt-1" style={{ color: currentTheme.text }}>
                            The best platform to connect with professionals and job seekers.
                        </Text>
                    </View>

                    <View className="rounded-xl p-4 shadow-md" style={{ backgroundColor: currentTheme.card }}>
                        <Text className="text-lg font-semibold mb-3" style={{ color: currentTheme.primary }}>
                            Online Users ({onlineUsers.length - 1})
                        </Text>
                        {onlineUsers.length > 0 && !(onlineUsers.length == 1 && onlineUsers[0].id == userInfo.id) ? (
                            <FlatList
                                data={onlineUsers.filter(user => user.id !== userInfo.id)}
                                renderItem={({ item }) => <OnlineUserItem user={item} theme={currentTheme} />}
                                keyExtractor={(item) => item.id}
                                contentContainerStyle={{ paddingBottom: 16 }}
                                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                            />
                        ) : (
                            <Text className="text-center py-4" style={{ color: currentTheme.text }}>
                                No other users online
                            </Text>
                        )}
                    </View>
                </>
            ) : (
                <Text className="text-lg font-bold text-center" style={{ color: currentTheme.primary }}>
                    You are not logged in. Please log in to continue.
                </Text>
            )}
        </View>
    );
}
