
import * as React from 'react';
import { View, Text } from 'react-native';
import { NAV_THEME } from '~/lib/constants';
import { useColorScheme } from '~/lib/useColorScheme';
import {Button} from "~/components/ui/button";
import {useAuth} from "~/lib/auth/authContext";

export default function SettingsScreen() {
  const { isDarkColorScheme } = useColorScheme();
  const { handleLogout } = useAuth();

  const currentTheme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light;

  return (
      <View
          className="flex-1 justify-center items-center p-4"
          style={{ backgroundColor: currentTheme.background }}
      >
        <Text
            className="text-3xl font-bold text-center"
            style={{ color: currentTheme.primary }}
        >
          Settings
        </Text>

        <Text
            className="text-lg text-center mt-2"
            style={{ color: currentTheme.text }}
        >
          Manage your account settings and preferences.
        </Text>


        <Button
            size="lg"
            className="mt-4"
            style={{ backgroundColor: currentTheme.buttonsPrimary }}
            onPress={handleLogout}
        >
          <Text className="font-semibold text-lg" style={{ color: currentTheme.primaryForeground }}>
            Logout
          </Text>
        </Button>
      </View>
  );
}