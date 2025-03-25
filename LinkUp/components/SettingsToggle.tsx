// components/SettingsToggle.tsx
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { useColorScheme } from '~/lib/useColorScheme';
import { cn } from '~/lib/utils';
import { NAV_THEME } from '~/lib/constants';

export function SettingsToggle() {
  const { isDarkColorScheme } = useColorScheme();
  const navigation = useNavigation();
  const theme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light;

  const isSettings = navigation.getState()?.routes[0]?.state?.index === 3;

  const handlePress = () => {
    if (isSettings) {
      // @ts-ignore
      navigation.navigate('Home');
    } else {
      // @ts-ignore
      navigation.navigate('Settings');
    }
  };

  return (
      <Pressable
          onPress={handlePress}
          className="web:ring-offset-background web:transition-colors web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2"
          disabled={isSettings}
      >
        {({ pressed }) => (
            <View
                className={cn(
                    'flex-1 aspect-square pt-0.5 justify-center items-start web:px-5 ml-2',
                    pressed && 'opacity-70'
                )}
            >
              <Ionicons
                  name={isSettings ? 'home' : 'settings'}
                  size={24}
                  color={isSettings ? theme.muted : theme.mutedForeground}
              />
            </View>
        )}
      </Pressable>
  );
}