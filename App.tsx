import { useEffect, useState } from 'react';
import { useColorScheme, StyleSheet, View } from 'react-native';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Button, PaperProvider, Text } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createAppServices } from './src/shell/bootstrap';
import { FeedbackProvider } from './src/shell/FeedbackProvider';
import { NotificationObserver } from './src/shell/notificationObserver';
import { RootNavigator } from './src/shell/RootNavigator';
import { ServicesProvider } from './src/shell/ServicesProvider';
import type { RootStackParamList } from './src/shell/RootNavigator';
import type { Services } from './src/services/types';
import { darkTheme } from './src/theme/darkTheme';
import { lightTheme } from './src/theme/lightTheme';
import { navigationTheme } from './src/theme/navigationTheme';

type AppProps = {
  createServices?: () => Promise<Services>;
};

export default function App({ createServices = createAppServices }: AppProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? darkTheme : lightTheme;
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const [services, setServices] = useState<Services | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    void createServices()
      .then((nextServices) => {
        if (active) {
          setServices(nextServices);
        }
      })
      .catch(() => {
        if (active) {
          setError(true);
        }
      });

    return () => {
      active = false;
    };
  }, [attempt, createServices]);

  const retry = () => {
    setError(false);
    setServices(null);
    setAttempt((current) => current + 1);
  };

  if (error) {
    return (
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
            <Text variant="headlineSmall">Data gagal dimuat</Text>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>Coba muat ulang aplikasi.</Text>
            <Button mode="contained" onPress={retry}>
              Coba lagi
            </Button>
          </View>
        </PaperProvider>
      </SafeAreaProvider>
    );
  }

  if (services === null) {
    return (
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
            <ActivityIndicator />
            <Text style={{ color: theme.colors.onSurfaceVariant }}>Memuat data...</Text>
          </View>
        </PaperProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <ServicesProvider services={services}>
          <FeedbackProvider>
            <NavigationContainer
              ref={navigationRef}
              theme={isDark ? navigationTheme.dark : navigationTheme.light}
            >
              <RootNavigator />
              <NotificationObserver navigationRef={navigationRef} />
            </NavigationContainer>
          </FeedbackProvider>
        </ServicesProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    padding: 24,
  },
});
