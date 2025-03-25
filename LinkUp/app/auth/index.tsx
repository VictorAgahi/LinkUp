import * as React from 'react';
import { View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { Link } from 'expo-router';
import { useColorScheme } from '~/lib/useColorScheme';
import { NAV_THEME } from '~/lib/constants';

export default function LobbyScreen() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const currentTheme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light;

  return (
      <View className={`flex-1 justify-center items-center p-4`} style={{
        backgroundColor: currentTheme.background,
      }}>
        <Animated.View entering={FadeInUp.duration(800)} className="w-full max-w-sm">
          <Card className={`rounded-2xl shadow-xl`} style={{
            backgroundColor: currentTheme.card,
            borderColor: currentTheme.border,
          }}>
            <CardHeader className="items-center" style={{
              backgroundColor: currentTheme.card,
            }}>
              <Animated.View entering={FadeInUp.duration(1000)}>
                <Text className="text-3xl font-extrabold" style={{
                  color: currentTheme.text,
                }}>
                  Welcome to LINK-
                  <Text className="text-3xl font-extrabold" style={{
                    color: currentTheme.primary,
                  }}>
                     UP
                  </Text>
                </Text>
              </Animated.View>
            </CardHeader>
            <CardContent className="gap-5 mt-4" style={{
              backgroundColor: currentTheme.card,
            }}>
              <Text className={`text-center text-lg`} style={{
                color: currentTheme.secondaryForeground,
              }}>
                Secure messaging platform with end-to-end encryption
              </Text>

              <View className="flex-row gap-3">
                <Link href="/auth/login" asChild>
                  <Button
                      variant="outline"
                      className={`flex-1 rounded-lg h-12 `}
                      style={{
                        backgroundColor: currentTheme.buttonsPrimary,
                      }}
                  >
                    <Text style={{
                      color: 'white'
                    }}>
                      Sign In
                    </Text>
                  </Button>
                </Link>

                <Link href="/auth/register" asChild>
                  <Button
                      className={`flex-1 rounded-lg h-12 `}
                      style={{
                        backgroundColor: currentTheme.buttonsSecondary,
                      }}
                  >
                    <Text className="text-white font-medium">Get Started</Text>
                  </Button>
                </Link>
              </View>

              <Text className={`text-center text-sm`} style={{
                color: currentTheme.mutedForeground,
              }}>
                By continuing, you agree to our Terms of Service
              </Text>
            </CardContent>
          </Card>
        </Animated.View>
      </View>
  );
}