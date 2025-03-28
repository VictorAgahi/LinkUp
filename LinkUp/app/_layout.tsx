import * as React from 'react';
import '~/global.css';
import { DarkTheme, DefaultTheme, Theme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { NAV_THEME } from '~/lib/constants';
import { useColorScheme } from '~/lib/useColorScheme';
import { PortalHost } from '@rn-primitives/portal';
import { ThemeToggle } from '~/components/ThemeToggle';
import { setAndroidNavigationBar } from '~/lib/android-navigation-bar';
import { AuthProvider, useAuth } from "~/lib/auth/authContext";
import {QueryClient} from "@tanstack/query-core";

const LIGHT_THEME: Theme = {
    ...DefaultTheme,
    colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
    ...DarkTheme,
    colors: NAV_THEME.dark,
};


export { ErrorBoundary } from 'expo-router';

function Layout() {
    const hasMounted = React.useRef(false);
    const { colorScheme, isDarkColorScheme } = useColorScheme();
    const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);
    const auth = useAuth();
    const router = useRouter();

    React.useEffect(() => {
        if (!auth) return;

        if (auth.isAuthenticated === null) {
            return;
        }
        if (auth.isAuthenticated) {
            router.replace('/home');
        } else {
            router.replace('/auth');
        }
    }, [auth?.isAuthenticated]);

    useIsomorphicLayoutEffect(() => {
        if (hasMounted.current) return;

        if (Platform.OS === 'web') {
            document.documentElement.classList.add('bg-background');
        }
        setAndroidNavigationBar(colorScheme);
        setIsColorSchemeLoaded(true);
        hasMounted.current = true;
    }, []);

    if (!isColorSchemeLoaded || auth?.isAuthenticated === null) {
        return null;
    }

    return (
        <ThemeProvider value={colorScheme == 'dark' ? DARK_THEME : LIGHT_THEME}>
            <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
            <Stack
                screenOptions={{
                    headerTitleStyle: {
                        fontWeight: '700',
                        fontSize: 18,
                        color: isDarkColorScheme ? '' : '#000',
                    },
                    headerTintColor: isDarkColorScheme ? '#fff' : '#000',
                    headerBackTitle: 'Back',
                    headerRight: () => <ThemeToggle />,
                    headerStyle: {
                        backgroundColor: isDarkColorScheme
                            ? NAV_THEME.dark.card
                            : NAV_THEME.light.card,
                    },
                }}
            >
                <Stack.Screen
                    name="auth/index"
                    options={{ headerTitle: 'LobbyPage' }}
                />
                <Stack.Screen
                    name="auth/register/index"
                    options={{ headerTitle: 'RegisterPage' }}
                />
                <Stack.Screen
                    name="auth/login/index"
                    options={{ headerTitle: 'LoginPage' }}
                />

                <Stack.Screen
                    name="home"
                    options={{ headerShown: false }}
                    redirect={!auth?.isAuthenticated}
                />
            </Stack>
            <PortalHost />
        </ThemeProvider>
    );
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <Layout />
        </AuthProvider>
    );
}

const useIsomorphicLayoutEffect =
    Platform.OS === 'web' && typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;