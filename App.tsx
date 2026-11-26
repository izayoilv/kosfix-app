import { MD3LightTheme, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, Text } from 'react-native';

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={MD3LightTheme}>
        <Text style={styles.wordmark}>KosFix</Text>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  wordmark: {
    color: MD3LightTheme.colors.primary,
    fontSize: 28,
    fontWeight: '700',
    marginTop: 48,
    textAlign: 'center',
  },
});
