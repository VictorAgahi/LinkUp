import * as React from 'react';
import { View, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { NAV_THEME } from '~/lib/constants';
import { useColorScheme } from '~/lib/useColorScheme';
import { useAuth } from '~/lib/auth/authContext';
import { getToken } from '~/lib/store/secureStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {BACKEND_URL} from "@env";

interface UserInfo {
  firstName: string;
  lastName: string;
  username: string;
}

interface UserFormState {
  firstName: string;
  lastName: string;
  username: string;
}


export default function SettingsScreen() {
  const { isDarkColorScheme } = useColorScheme();
  const { handleLogout, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const currentTheme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light;

  const { data: userInfo, isLoading } = useQuery<UserInfo>({
    queryKey: ['userInfo'],
    queryFn: async () => {
      const token = await getToken("accessToken");
      if (!token) throw new Error("No access token found");

      const response = await fetch(`${BACKEND_URL}/user/info`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      return await response.json() as Promise<UserInfo>;
    },
    enabled: !!isAuthenticated,
    staleTime: 0,
  });

  // Form state
  const [formState, setFormState] = React.useState<UserFormState>({
    firstName: '',
    lastName: '',
    username: ''
  });

  React.useEffect(() => {
    if (userInfo) {
      setFormState({
        firstName: userInfo.firstName || '',
        lastName: userInfo.lastName || '',
        username: userInfo.username || ''
      });
    }
  }, [userInfo]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (userData: UserFormState) => {
      const token = await getToken("accessToken");
      if (!token) throw new Error("No access token found");

      const URL = process.env.BACKEND_URL || "http://localhost:3000";
      const response = await fetch(`${URL}/user/update`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      return await response.json() as Promise<UserInfo>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userInfo'] });
      Alert.alert("Success", "Profile updated successfully");
    },
    onError: (error: Error) => {
      Alert.alert("Error", error.message || "Update failed");
    }
  });

  return (
      <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          style={{ backgroundColor: currentTheme.background }}
      >
        <View className="flex-1 p-6">
          <Text className="text-2xl font-bold mb-6" style={{ color: currentTheme.primary }}>
            Profile Settings
          </Text>

          {isLoading ? (
              <ActivityIndicator size="large" color={currentTheme.primary} />
          ) : (
              <>
                <View className="mb-6">
                  <Text className="text-sm mb-2" style={{ color: currentTheme.text }}>
                    First Name
                  </Text>
                  <TextInput
                      className="p-4 rounded-lg"
                      style={{
                        backgroundColor: currentTheme.card,
                        color: currentTheme.text,
                        borderColor: currentTheme.border,
                        borderWidth: 1
                      }}
                      placeholderTextColor={currentTheme.mutedForeground}
                      value={formState.firstName}
                      onChangeText={text => setFormState(prev => ({ ...prev, firstName: text }))}
                  />
                </View>

                <View className="mb-6">
                  <Text className="text-sm mb-2" style={{ color: currentTheme.text }}>
                    Last Name
                  </Text>
                  <TextInput
                      className="p-4 rounded-lg"
                      style={{
                        backgroundColor: currentTheme.card,
                        color: currentTheme.text,
                        borderColor: currentTheme.border,
                        borderWidth: 1
                      }}
                      placeholderTextColor={currentTheme.mutedForeground}
                      value={formState.lastName}
                      onChangeText={text => setFormState(prev => ({ ...prev, lastName: text }))}
                  />
                </View>

                <View className="mb-8">
                  <Text className="text-sm mb-2" style={{ color: currentTheme.text }}>
                    Username
                  </Text>
                  <TextInput
                      className="p-4 rounded-lg"
                      style={{
                        backgroundColor: currentTheme.card,
                        color: currentTheme.text,
                        borderColor: currentTheme.border,
                        borderWidth: 1
                      }}
                      placeholderTextColor={currentTheme.mutedForeground}
                      value={formState.username}
                      onChangeText={text => setFormState(prev => ({ ...prev, username: text }))}
                  />
                </View>

                <Button
                    size="lg"
                    className="mb-4"
                    style={{ backgroundColor: currentTheme.buttonsPrimary }}
                    onPress={() => mutate(formState)}
                    disabled={isPending}
                >
                  {isPending ? (
                      <ActivityIndicator size="small" color={currentTheme.primaryForeground} />
                  ) : (
                      <Text style={{ color: currentTheme.primaryForeground }}>Save Changes</Text>
                  )}
                </Button>

                <Button
                    size="lg"
                    variant="destructive"
                    style={{ backgroundColor: currentTheme.notification }}
                    onPress={handleLogout}
                >
                  <Text style={{ color: currentTheme.primaryForeground }}>Logout</Text>
                </Button>
              </>
          )}
        </View>
      </ScrollView>
  );
}