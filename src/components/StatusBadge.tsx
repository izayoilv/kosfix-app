import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { radius, spacing, statusPalette } from '../theme/tokens';
import type { ItemStatus } from '../domain/types';

const LABELS: Record<ItemStatus, string> = {
  rusak: 'Rusak',
  dikerjakan: 'Dikerjakan',
  selesai: 'Selesai',
};

export function StatusBadge({ status }: { status: ItemStatus }) {
  const theme = useTheme();
  const tone = statusPalette[theme.dark ? 'dark' : 'light'][status];

  return (
    <View style={[styles.badge, { backgroundColor: tone.background }]}>
      <Text style={[styles.label, { color: tone.foreground }]}>{LABELS[status]}</Text>
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
