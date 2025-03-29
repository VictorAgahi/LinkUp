// app/home/_layout.tsx
import React, {useEffect} from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './index';
import ChatScreen from './chat/index';
import ProfileScreen from './profile/index';
import SettingsScreen from './settings/index';
import { Ionicons } from '@expo/vector-icons';
import { ThemeToggle } from '~/components/ThemeToggle';
import { SettingsToggle } from '~/components/SettingsToggle';
import { useColorScheme } from '~/lib/useColorScheme';
import { NAV_THEME } from '~/lib/constants';
import {QueryClient} from "@tanstack/query-core";
import {QueryClientProvider} from "@tanstack/react-query";
import {WebsocketProvider} from "~/lib/websockets/WebSocketContext";

const Tab = createBottomTabNavigator();
const StackNav = createStackNavigator();
const queryClient = new QueryClient();
const TabNavigator = () => {
    const { isDarkColorScheme } = useColorScheme();
    const theme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light;


    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: true,
                headerStyle: {
                    backgroundColor: theme.background,
                },
                headerTintColor: theme.reversed,
                headerTitleAlign: 'center',
                headerRight: () => <ThemeToggle />,
                headerLeft: () => <SettingsToggle />,
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
                    title: 'Accueil',
                }}
            />
            <Tab.Screen
                name="Chat"
                component={ChatScreen}
                options={{
                    tabBarIcon: ({ color }) => <Ionicons name="chatbubble" size={24} color={color} />,
                    title: 'Chat',
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
                    title: 'Profil',
                }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    tabBarIcon: ({ color }) => <Ionicons name="settings" size={24} color={color} />,
                    title: 'Paramètres',
                    headerLeft: () => null,
                }}
            />
        </Tab.Navigator>
    );
};

const HomeLayout = () => {
    return (
    <WebsocketProvider>
            <QueryClientProvider client={queryClient}>
                <TabNavigator />
            </QueryClientProvider>
    </WebsocketProvider>
    )
};

export default HomeLayout;