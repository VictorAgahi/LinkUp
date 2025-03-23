import * as React from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';

export default function ProfileScreen() {
  const { colorScheme } = useColorScheme();
  const router = useRouter();

  return (
      <View className={`flex-1 justify-center items-center p-4 
      ${colorScheme === 'dark'
          ? 'bg-gradient-to-b from-slate-900 to-slate-800'
          : 'bg-gradient-to-b from-sky-100 to-blue-100'
      }`}>
        <Animated.View entering={FadeInUp.duration(800)} className="w-full max-w-sm">
          <Card className="bg-card/95 backdrop-blur shadow-xl rounded-2xl">
            <CardHeader className="items-center">
              <Animated.View entering={FadeInUp.duration(1000)}>
                <CardTitle className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Welcome to LinkUp
                </CardTitle>
              </Animated.View>
            </CardHeader>
            <CardContent className="gap-5 mt-4">
              <Text className="text-muted-foreground text-center text-lg">
                Secure messaging platform with end-to-end encryption
              </Text>


              <Text className="text-center text-sm text-muted-foreground mt-4">
                By continuing, you agree to our Terms of Service
              </Text>
            </CardContent>
          </Card>
        </Animated.View>
      </View>
  );
}