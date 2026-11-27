import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import splashImage from '../../assets/splash-icon.png';

const LIGHT_BACKGROUND = '#0F766E';
const DARK_BACKGROUND = '#0F172A';

type LoadingScreenProps = {
  label?: string;
};

export function LoadingScreen({ label = 'Memuat data...' }: LoadingScreenProps) {
  const isDark = useColorScheme() === 'dark';
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 750,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    animation.start();

    return () => animation.stop();
  }, [progress]);

  const imageScale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1],
  });
  const labelOpacity = progress.interpolate({
    inputRange: [0.35, 1],
    outputRange: [0, 1],
  });

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.screen, { backgroundColor: isDark ? DARK_BACKGROUND : LIGHT_BACKGROUND }]}
      testID="loading-screen"
    >
      <StatusBar style="light" />
      <Animated.Image
        source={splashImage}
        resizeMode="contain"
        accessibilityLabel="KosFix"
        style={[styles.image, { transform: [{ scale: imageScale }] }]}
      />
      <Animated.Text style={[styles.label, { opacity: labelOpacity }]}>{label}</Animated.Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  image: {
    height: 220,
    width: 220,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.78)',
    fontSize: 14,
    letterSpacing: 0.3,
    marginTop: 20,
  },
});
