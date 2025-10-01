
import "react-native-reanimated";
import { useEffect, useState } from "react";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from "@expo-google-fonts/roboto";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme, Text, View, StyleSheet } from "react-native";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppProvider } from "@/contexts/AppContext";
import { colors } from "@/styles/commonStyles";
import { logFontStatus } from "@/utils/fontVerification";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "welcome",
};

// Font loading component with fallback
function FontLoader({ children }: { children: React.ReactNode }) {
  const [fontsLoaded, fontsError] = useFonts({
    // Google Fonts
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
    // Local fonts as fallback
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    SpaceMonoBold: require("../assets/fonts/SpaceMono-Bold.ttf"),
  });

  const [fontLoadTimeout, setFontLoadTimeout] = useState(false);
  const [fontVerificationComplete, setFontVerificationComplete] = useState(false);

  useEffect(() => {
    // Set a timeout for font loading (increased from 6000ms to 15000ms)
    const timeout = setTimeout(() => {
      console.log('Font loading timeout reached, using fallback fonts');
      setFontLoadTimeout(true);
      SplashScreen.hideAsync();
    }, 15000); // 15 seconds timeout

    if (fontsLoaded || fontsError) {
      clearTimeout(timeout);
      console.log('Fonts loaded successfully:', fontsLoaded);
      if (fontsError) {
        console.error('Font loading error:', fontsError);
      }
      
      // Verify font loading status
      logFontStatus().then(() => {
        setFontVerificationComplete(true);
        SplashScreen.hideAsync();
      }).catch((error) => {
        console.error('Font verification failed:', error);
        setFontVerificationComplete(true);
        SplashScreen.hideAsync();
      });
    }

    return () => clearTimeout(timeout);
  }, [fontsLoaded, fontsError]);

  // Show loading screen while fonts are loading
  if (!fontsLoaded && !fontsError && !fontLoadTimeout) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Fundee Cash...</Text>
        <Text style={styles.loadingSubtext}>Preparing fonts and assets</Text>
      </View>
    );
  }

  // Show error message if fonts failed to load but continue with fallback
  if (fontsError && !fontLoadTimeout) {
    console.warn('Font loading failed, using system fonts as fallback:', fontsError);
  }

  // Wait for font verification to complete
  if (!fontVerificationComplete && !fontLoadTimeout) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Fundee Cash...</Text>
        <Text style={styles.loadingSubtext}>Verifying fonts</Text>
      </View>
    );
  }

  return <>{children}</>;
}

// Navigation component that handles auth routing
function AppNavigator() {
  const { user, isLoading } = useAuth();

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Fundee Cash...</Text>
        <Text style={styles.loadingSubtext}>Checking authentication</Text>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {user ? (
        // Authenticated user screens
        <>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="modals/winner-popup"
            options={{
              presentation: "transparentModal",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="modals/ad-viewer"
            options={{
              presentation: "modal",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="modals/withdrawal"
            options={{
              presentation: "formSheet",
              sheetGrabberVisible: true,
              sheetAllowedDetents: [0.7, 1.0],
              sheetCornerRadius: 20,
              headerShown: false,
            }}
          />
        </>
      ) : (
        // Unauthenticated user screens
        <>
          <Stack.Screen name="welcome" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/signup" />
          <Stack.Screen name="auth/forgot-password" />
          <Stack.Screen name="email-confirmed" />
        </>
      )}
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const CustomDefaultTheme: Theme = {
    ...DefaultTheme,
    dark: false,
    colors: {
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      notification: colors.danger,
    },
  };

  const CustomDarkTheme: Theme = {
    ...DarkTheme,
    colors: {
      primary: colors.primary,
      background: "#1a1a1a",
      card: "#2d2d2d",
      text: "#ffffff",
      border: "#404040",
      notification: colors.danger,
    },
  };

  return (
    <>
      <StatusBar style="auto" animated />
      <FontLoader>
        <AuthProvider>
          <AppProvider>
            <ThemeProvider
              value={colorScheme === "dark" ? CustomDarkTheme : CustomDefaultTheme}
            >
              <GestureHandlerRootView style={{ flex: 1 }}>
                <AppNavigator />
                <SystemBars style={"auto"} />
              </GestureHandlerRootView>
            </ThemeProvider>
          </AppProvider>
        </AuthProvider>
      </FontLoader>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'System', // Use system font as fallback during loading
  },
  loadingSubtext: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'System', // Use system font as fallback during loading
  },
});
