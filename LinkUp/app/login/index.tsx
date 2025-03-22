import * as React from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {Input} from "~/components/ui/input";
import {Link} from "expo-router";
import {useColorScheme} from "~/lib/useColorScheme";

export default function LoginScreen() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const { isDarkColorScheme } = useColorScheme();
  const handleLogin = () => {
    console.log('Logging in with:', email, password);
  };

  return (
      <View className={`flex-1 justify-center p-4 ${isDarkColorScheme ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <Animated.View className="w-full max-w-md mx-auto">
          <Card className="bg-card">
            <CardHeader className="items-center">
              <CardTitle className="text-2xl font-bold text-primary">
                Welcome Back
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 gap-5 p-6">
              <Input
                  placeholder="Email"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
              />
              <Input
                  placeholder="Password"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
              />
              <Button className="bg-blue-700">
                <Text className="text-white font-medium">Sign In</Text>
              </Button>
              <View className="flex-row justify-between">
                <Link href="/register" asChild>
                  <Text className="text-primary">Create Account</Text>
                </Link>
                <Link href="/forgot-password" asChild>
                  <Text className="text-primary">Forgot Password?</Text>
                </Link>
              </View>
            </CardContent>
          </Card>
        </Animated.View>
      </View>
  );
}
