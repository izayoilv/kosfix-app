import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { spacing } from '../theme/tokens';

export function OverdueLabel({ visible }: { visible: boolean }) {
  const theme = useTheme();

  if (!visible) {
    return null;
  }

  return (
    <View
      style={[styles.label, { backgroundColor: theme.colors.errorContainer }]}
      accessible
      accessibilityLabel="Terlambat"
    >
      <Text style={[styles.text, { color: theme.colors.onErrorContainer }]}>Terlambat</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
  },
});
