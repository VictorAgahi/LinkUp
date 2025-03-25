import * as React from 'react';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import { NAV_THEME } from '~/lib/constants';
import { useColorScheme } from "~/lib/useColorScheme";

export default function HomeScreen() {
  const { isDarkColorScheme } = useColorScheme();

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
          Welcome Victor to LinkUp!
        </Text>

        <Text
            className="text-lg text-center mt-2"
            style={{ color: currentTheme.text }}
        >
          The best platform to connect with professionals and job seekers.
        </Text>
      </View>
  );
}