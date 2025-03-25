import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './index';
import ChatScreen from './chat/index';
import ProfileScreen from './profile/index';
import SettingsScreen from './settings/index';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';

const Tab = createBottomTabNavigator();

const HomeLayout = () => {
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <Tab.Navigator
                screenOptions={{
                    tabBarActiveTintColor: '#007AFF',
                    tabBarInactiveTintColor: '#8E8E93',
                }}
            >
                <Tab.Screen
                    name="index"
                    component={HomeScreen}
                    options={{
                        tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
                        title: 'Accueil',
                    }}
                />
                <Tab.Screen
                    name="chat"
                    component={ChatScreen}
                    options={{
                        tabBarIcon: ({ color }) => <Ionicons name="chatbubble" size={24} color={color} />,
                        title: 'Chat',
                    }}
                />
                <Tab.Screen
                    name="profile"
                    component={ProfileScreen}
                    options={{
                        tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
                        title: 'Profil',
                    }}
                />
                <Tab.Screen
                    name="settings"
                    component={SettingsScreen}
                    options={{
                        tabBarIcon: ({ color }) => <Ionicons name="settings" size={24} color={color} />,
                        title: 'Paramètres',
                    }}
                />
            </Tab.Navigator>
        </>
    );
};

export default HomeLayout;