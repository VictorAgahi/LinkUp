import * as React from 'react';
import {Alert, View} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from "~/components/ui/input";
import { Link } from "expo-router";
import { useColorScheme } from "~/lib/useColorScheme";
import { Text } from '~/components/ui/text';
import { NAV_THEME } from '~/lib/constants';
import {useAuth} from "~/lib/auth/authContext";

export default function LoginScreen() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const { isDarkColorScheme } = useColorScheme();
  const {handleLogin} = useAuth();
  const [error, setError] = React.useState('');

  const currentTheme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light;

  const validateInputs = () => {
    return true;
  };


  const handleSubmit = async () => {
    if (!validateInputs()) return;
    await handleLogin(email, password).catch((err) => {setError(err.data)});
  };

  return (
      <View
          className={`flex-1 justify-center items-center p-4`}
          style={{ backgroundColor: currentTheme.background }}
      >
        <Animated.View
            entering={FadeIn.delay(100)}
            exiting={FadeOut}
            className="w-full max-w-md mx-4"
        >
          <Card className="rounded-xl" style={{ backgroundColor: currentTheme.card }}>
            <CardHeader className="pb-6">
              <CardTitle
                  className="text-3xl font-extrabold text-center"
                  style={{ color: currentTheme.primary }}
              >
                Welcome Back
              </CardTitle>
              <Text className="text-center mt-2" style={{ color: currentTheme.text }}>
                Sign in to continue your journey
              </Text>
            </CardHeader>
            {error && <Text>{error}</Text>}
            <CardContent className="space-y-4">
              <View>
                <Text
                    className="text-sm mb-1 ml-1"
                    style={{ color: currentTheme.text }}
                >
                  Email
                </Text>
                <Input
                    placeholder="jim@pioche.com"
                    placeholderTextColor={isDarkColorScheme ? '#94a3b8' : '#64748b'}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                    style={{ backgroundColor: currentTheme.input, color: currentTheme.text }}
                />
              </View>

              <View>
                <Text
                    className="text-sm mb-1 ml-1"
                    style={{ color: currentTheme.text }}
                >
                  Password
                </Text>
                <Input
                    placeholder="••••••••"
                    placeholderTextColor={isDarkColorScheme ? '#94a3b8' : '#64748b'}
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    style={{ backgroundColor: currentTheme.input, color: currentTheme.text }}
                />
              </View>

              <Button
                  size="lg"
                  className="mt-4"
                  style={{ backgroundColor: currentTheme.buttonsPrimary }}
                  onPress={handleSubmit}
              >
                <Text className="font-semibold text-lg" style={{ color: currentTheme.primaryForeground }}>
                  Sign In
                </Text>
              </Button>

              <View className="flex-row justify-center space-x-1 mt-6">
                <Text className="text-muted-foreground" style={{ color: currentTheme.text }}>
                  Don't have an account?
                </Text>
                <Link href="/auth/register" asChild>
                  <Text className="text-primary font-semibold" style={{ color: currentTheme.primary }}>
                    Register
                  </Text>
                </Link>
              </View>

              <View className="mt-4">
                <Link href="/auth" asChild>
                  <Text className="text-center font-medium" style={{ color: currentTheme.primary }}>
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