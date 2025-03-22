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
      <View className={`flex-1 justify-center items-center p-4 ${isDarkColorScheme ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            className="w-full max-w-md"
        >
          <Card className="rounded-xl shadow-lg bg-card p-2">
            <CardHeader className="items-center">
              <CardTitle className="text-2xl font-bold text-primary">
                Create Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-20 gap-4">
              <View className="flex-row gap-5">
                <Input
                    placeholder="First Name"
                    className="flex-1"
                    value={form.firstName}
                    onChangeText={(val) => handleChange('firstName', val)}
                />
                <Input
                    placeholder="Last Name"
                    className="flex-1"
                    value={form.lastName}
                    onChangeText={(val) => handleChange('lastName', val)}
                />
              </View>
              <Input
                  placeholder="Username"
                  value={form.username}
                  onChangeText={(val) => handleChange('username', val)}
              />
              <Input
                  placeholder="Email"
                  value={form.email}
                  onChangeText={(val) => handleChange('email', val)}
                  keyboardType="email-address"
                  autoCapitalize="none"
              />
              <Input
                  placeholder="Password"
                  value={form.password}
                  onChangeText={(val) => handleChange('password', val)}
                  secureTextEntry
              />
              <Button className="mt-2 bg-blue-700" onPress={handleRegister}>
                <Text className="text-white font-medium">Register</Text>
              </Button>
              <Link href="/login" asChild>
                <Text className="text-center text-muted-foreground mt-4">
                  Already have an account?{' '}
                  <Text className="text-primary font-semibold">Login</Text>
                </Text>
              </Link>
            </CardContent>
          </Card>
        </Animated.View>
      </View>
  );
}