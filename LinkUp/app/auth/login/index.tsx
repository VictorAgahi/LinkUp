import * as React from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from "~/components/ui/input";
import { Link } from "expo-router";
import { useColorScheme } from "~/lib/useColorScheme";
import { Text } from '~/components/ui/text';

export default function LoginScreen() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const { isDarkColorScheme } = useColorScheme();

  const handleLogin = () => {
    console.log('Logging in with:', email, password);
  };

  return (
      <View className={`flex-1 justify-center items-center p-4 ${isDarkColorScheme ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <Animated.View
            entering={FadeIn.delay(100)}
            exiting={FadeOut}
            className="w-full max-w-md mx-4"
        >
          <Card className="rounded-xl bg-card border border-border">
            <CardHeader className="pb-6">
              <CardTitle className="text-3xl font-extrabold text-primary text-center">
                Welcome Back
              </CardTitle>
              <Text className="text-center text-muted-foreground mt-2">
                Sign in to continue your journey
              </Text>
            </CardHeader>
            <CardContent className="space-y-4">
              <View>
                <Text className="text-sm text-muted-foreground mb-1 ml-1">Email</Text>
                <Input
                    placeholder="jim@pioche.com"
                    placeholderTextColor={isDarkColorScheme ? '#94a3b8' : '#64748b'}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                />
              </View>

              <View>
                <Text className="text-sm text-muted-foreground mb-1 ml-1">Password</Text>
                <Input
                    placeholder="••••••••"
                    placeholderTextColor={isDarkColorScheme ? '#94a3b8' : '#64748b'}
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />
              </View>

              <Button
                  size="lg"
                  className="mt-4 bg-primary hover:bg-primary/90 active:bg-primary/80"
                  onPress={handleLogin}
              >
                <Text className="font-semibold text-lg text-primary-foreground">Sign In</Text>
              </Button>

              <View className="flex-row justify-center space-x-1 mt-6">
                <Text className="text-muted-foreground">Don't have an account?</Text>
                <Link href="/auth/register" asChild>
                  <Text className="text-primary font-semibold hover:text-primary/80">
                    Register
                  </Text>
                </Link>
              </View>

              <View className="mt-4">
                <Link href="/auth" asChild>
                  <Text className="text-center text-primary font-medium hover:text-primary/80">
                    Forgot Password?
                  </Text>
                </Link>
              </View>
            </CardContent>
          </Card>
        </Animated.View>
      </View>
  );
}