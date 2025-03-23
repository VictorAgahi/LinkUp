import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { useColorScheme } from '~/lib/useColorScheme';
import validator from 'validator';
import { Text } from '~/components/ui/text';
import { Link } from 'expo-router';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

export default function RegisterScreen() {
  const { isDarkColorScheme } = useColorScheme();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
  });

  const validateInputs = () => {
    const { firstName, lastName, username, email, password } = form;
    if (!firstName || !lastName || !username || !email || !password) {
      Alert.alert('Error', 'All fields must be filled.');
      return false;
    }
    if (!validator.isEmail(email)) {
      Alert.alert('Error', 'Invalid email format.');
      return false;
    }
    if (!validator.isStrongPassword(password, { minLength: 8, minUppercase: 1, minNumbers: 1 })) {
      Alert.alert('Error', 'Password must be at least 8 characters long and include a number and an uppercase letter.');
      return false;
    }
    return true;
  };

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };


  const handleRegister = () => {
    if (!validateInputs()) return;
    Alert.alert('Success', 'Registration completed!');
  };

  return (
      <View className={`flex-1 justify-center items-center p-4 bg-primary`}>
        <Animated.View
            entering={FadeIn.delay(100)}
            exiting={FadeOut}
            className="w-full max-w-md mx-4" // Ajout de mx-4 pour les petits écrans
        >
          <Card className="rounded-xl bg-secondary border border-border  ">
            <CardHeader className="pb-6">
              <CardTitle className="text-3xl font-extrabold text-primary text-center">
                Join Us
              </CardTitle>
              <Text className="text-center text-muted-foreground mt-2">
                Create your account to get started
              </Text>
            </CardHeader>
            <CardContent className="space-y-4">
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-sm text-muted-foreground mb-1 ml-1">First Name</Text>
                  <Input
                      placeholder="Jim"
                      className="h-12"
                      placeholderTextColor={isDarkColorScheme ? '#94a3b8' : '#64748b'}
                      value={form.firstName}
                      onChangeText={(val) => handleChange('firstName', val)}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm text-muted-foreground mb-1 ml-1">Last Name</Text>
                  <Input
                      placeholder="Pioche"
                      className="h-12"
                      placeholderTextColor={isDarkColorScheme ? '#94a3b8' : '#64748b'}
                      value={form.lastName}
                      onChangeText={(val) => handleChange('lastName', val)}
                  />
                </View>
              </View>

              <View>
                <Text className="text-sm text-muted-foreground mb-1 ml-1">Username</Text>
                <Input
                    placeholder="jimpioche123"
                    placeholderTextColor={isDarkColorScheme ? '#94a3b8' : '#64748b'}
                    value={form.username}
                    onChangeText={(val) => handleChange('username', val)}
                />
              </View>

              <View>
                <Text className="text-sm text-muted-foreground mb-1 ml-1">Email</Text>
                <Input
                    placeholder="jim@pioche.com"
                    placeholderTextColor={isDarkColorScheme ? '#94a3b8' : '#64748b'}
                    value={form.email}
                    onChangeText={(val) => handleChange('email', val)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
              </View>

              <View>
                <Text className="text-sm text-muted-foreground mb-1 ml-1">Password</Text>
                <Input
                    placeholder="••••••••"
                    placeholderTextColor={isDarkColorScheme ? '#94a3b8' : '#64748b'}
                    value={form.password}
                    onChangeText={(val) => handleChange('password', val)}
                    secureTextEntry
                />
              </View>

              <Button
                  size="lg"
                  className="mt-4 bg-primary text-secondary hover:bg-primary/90 active:bg-primary/80"
                  onPress={handleRegister}
              >
                <Text className=" font-semibold text-lg">Create Account</Text>
              </Button>

              <View className="flex-row justify-center space-x-1 mt-6">
                <Text className="text-muted-foreground">Already have an account? </Text>
                <Link href="/auth/login" asChild>
                  <Text className="text-primary font-semibold hover:text-primary/80">
                    Sign in
                  </Text>
                </Link>
              </View>
            </CardContent>
          </Card>
        </Animated.View>
      </View>
  );
}