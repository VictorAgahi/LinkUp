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
import { NAV_THEME } from '~/lib/constants';
import { useAuth } from "~/lib/auth/authContext";

export default function RegisterScreen() {
  const { isDarkColorScheme } = useColorScheme();
  const { handleRegister } = useAuth();
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

  const handleSubmit = async () => {
    if (!validateInputs()) return;
    const values = {
      firstName: form.firstName,
      lastName: form.lastName,
      username: form.username,
      email: form.email,
      password: form.password,
    };
    await handleRegister(values);
  };

  const currentTheme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light;

  return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: currentTheme.background,
      }}>
        <Animated.View
            entering={FadeIn.delay(100)}
            exiting={FadeOut}
            style={{ width: '100%', maxWidth: 400, marginHorizontal: 16 }}
        >
          <Card style={{
            borderRadius: 16,
            backgroundColor: currentTheme.card,
            borderColor: currentTheme.border,
            borderWidth: 1,
          }}>
            <CardHeader style={{ paddingBottom: 24 }}>
              <CardTitle style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: currentTheme.primary,
                textAlign: 'center',
              }}>
                Join Us
              </CardTitle>
              <Text style={{
                textAlign: 'center',
                color: currentTheme.mutedForeground,
                marginTop: 8,
              }}>
                Create your account to get started
              </Text>
            </CardHeader>
            <CardContent style={{ marginTop: 16, gap: 16 }}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 12,
                    color: currentTheme.mutedForeground,
                    marginBottom: 4,
                  }}>First Name</Text>
                  <Input
                      placeholder="Jim"
                      style={{
                        height: 48,
                        color: currentTheme.text,
                        backgroundColor: currentTheme.input,
                      }}
                      placeholderTextColor={isDarkColorScheme ? '#94a3b8' : '#64748b'}
                      value={form.firstName}
                      onChangeText={(val) => handleChange('firstName', val)}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 12,
                    color: currentTheme.mutedForeground,
                    marginBottom: 4,
                  }}>Last Name</Text>
                  <Input
                      placeholder="Pioche"
                      style={{
                        height: 48,
                        color: currentTheme.text,
                        backgroundColor: currentTheme.input,
                      }}
                      placeholderTextColor={isDarkColorScheme ? '#94a3b8' : '#64748b'}
                      value={form.lastName}
                      onChangeText={(val) => handleChange('lastName', val)}
                  />
                </View>
              </View>

              <View>
                <Text style={{
                  fontSize: 12,
                  color: isDarkColorScheme ? NAV_THEME.dark.mutedForeground : NAV_THEME.light.mutedForeground,
                  marginBottom: 4,
                }}>Username</Text>
                <Input
                    placeholder="jimpioche123"
                    style={{
                      color: isDarkColorScheme ? NAV_THEME.dark.text : NAV_THEME.light.text,
                      backgroundColor: isDarkColorScheme ? NAV_THEME.dark.input : NAV_THEME.light.input,
                    }}
                    placeholderTextColor={isDarkColorScheme ? '#94a3b8' : '#64748b'}
                    value={form.username}
                    onChangeText={(val) => handleChange('username', val)}
                />
              </View>

              <View>
                <Text style={{
                  fontSize: 12,
                  color: isDarkColorScheme ? NAV_THEME.dark.mutedForeground : NAV_THEME.light.mutedForeground,
                  marginBottom: 4,
                }}>Email</Text>
                <Input
                    placeholder="jim@pioche.com"
                    style={{
                      color: isDarkColorScheme ? NAV_THEME.dark.text : NAV_THEME.light.text,
                      backgroundColor: isDarkColorScheme ? NAV_THEME.dark.input : NAV_THEME.light.input,
                    }}
                    placeholderTextColor={isDarkColorScheme ? '#94a3b8' : '#64748b'}
                    value={form.email}
                    onChangeText={(val) => handleChange('email', val)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
              </View>

              <View>
                <Text style={{
                  fontSize: 12,
                  color: isDarkColorScheme ? NAV_THEME.dark.mutedForeground : NAV_THEME.light.mutedForeground,
                  marginBottom: 4,
                }}>Password</Text>
                <Input
                    placeholder="••••••••"
                    style={{
                      color: isDarkColorScheme ? NAV_THEME.dark.text : NAV_THEME.light.text,
                      backgroundColor: isDarkColorScheme ? NAV_THEME.dark.input : NAV_THEME.light.input,
                    }}
                    placeholderTextColor={isDarkColorScheme ? '#94a3b8' : '#64748b'}
                    value={form.password}
                    onChangeText={(val) => handleChange('password', val)}
                    secureTextEntry
                />
              </View>

              <Button
                  size="lg"
                  style={{
                    marginTop: 16,
                    backgroundColor: isDarkColorScheme ? NAV_THEME.dark.buttonsPrimary : NAV_THEME.light.buttonsPrimary,
                  }}
                  onPress={handleSubmit}
              >
                <Text style={{ fontWeight: '600', fontSize: 18 }}>Create Account</Text>
              </Button>

              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4, marginTop: 24 }}>
                <Text style={{
                  color: isDarkColorScheme ? NAV_THEME.dark.mutedForeground : NAV_THEME.light.mutedForeground,
                }}>Already have an account? </Text>
                <Link href="/auth/login" asChild>
                  <Text style={{
                    color: isDarkColorScheme ? NAV_THEME.dark.primary : NAV_THEME.light.primary,
                    fontWeight: '600',
                    textDecorationLine: 'underline',
                  }}>
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