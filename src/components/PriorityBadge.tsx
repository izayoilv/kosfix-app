import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { priorityPalette, radius, spacing } from '../theme/tokens';
import type { Priority } from '../domain/types';

const LABELS: Record<Priority, string> = {
  rendah: 'Rendah',
  sedang: 'Sedang',
  tinggi: 'Tinggi',
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const theme = useTheme();
  const tone = priorityPalette[theme.dark ? 'dark' : 'light'][priority];

  return (
    <View style={[styles.badge, { backgroundColor: tone.background }]}>
      <Text style={[styles.label, { color: tone.foreground }]}>{LABELS[priority]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
  },
});
