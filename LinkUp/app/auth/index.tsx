// app/auth/lobby/index.tsx
import * as React from 'react';
import { View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Link } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { NAV_THEME } from '~/lib/constants';

export default function LobbyScreen() {
  const { colorScheme } = useColorScheme();

  return (
      <View className={`flex-1 justify-center items-center p-4 
      ${colorScheme === 'dark'
          ? 'bg-slate-900'
          : 'bg-sky-100'
      }`}>
        <Animated.View entering={FadeInUp.duration(800)} className="w-full max-w-sm">
          <Card className={`rounded-2xl shadow-xl ${
              colorScheme === 'dark'
                  ? 'bg-slate-800 border-slate-700'
                  : 'bg-white border-slate-200'
          }`}>
            <CardHeader className="items-center">
              <Animated.View entering={FadeInUp.duration(1000)}>
                <Text className="text-3xl font-extrabold text-primary">
                  Welcome to LinkUp
                </Text>
              </Animated.View>
            </CardHeader>
            <CardContent className="gap-5 mt-4">
              <Text className={`text-center text-lg ${
                  colorScheme === 'dark' ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Secure messaging platform with end-to-end encryption
              </Text>

              <View className="flex-row gap-3">
                <Link href="/auth/login" asChild>
                  <Button
                      variant="outline"
                      className={`flex-1 rounded-lg h-12 bg-secondary`}
                  >
                    <Text>
                      Sign In
                    </Text>
                  </Button>
                </Link>

                <Link href="/auth/register" asChild>
                  <Button
                      className="flex-1 bg-primary rounded-lg h-12"
                  >
                    <Text className="text-white font-medium">Get Started</Text>
                  </Button>
                </Link>
              </View>

              <Text className={`text-center text-sm ${
                  colorScheme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`}>
                By continuing, you agree to our Terms of Service
              </Text>
            </CardContent>
          </Card>
        </Animated.View>
      </View>
  );
}