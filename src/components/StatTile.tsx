import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Surface, Text, useTheme } from 'react-native-paper';
import { radius, spacing } from '../theme/tokens';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

type StatTileProps = {
  label: string;
  value: string;
  icon?: IconName;
  unit?: string;
  accessibilityLabel?: string;
};

export function StatTile({ label, value, icon, unit, accessibilityLabel }: StatTileProps) {
  const theme = useTheme();
  const computedLabel =
    accessibilityLabel ?? `${label}, ${value}${unit === undefined ? '' : ` ${unit}`}`;

  return (
    <Surface
      style={[styles.tile, { backgroundColor: theme.colors.surface }]}
      accessible
      accessibilityLabel={computedLabel}
    >
      <View style={styles.header}>
        <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>{label}</Text>
        {icon === undefined ? null : (
          <MaterialCommunityIcons name={icon} size={18} color={theme.colors.primary} />
        )}
      </View>
      <Text style={[styles.value, { color: theme.colors.onSurface }]}>{value}</Text>
    </Surface>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: radius.card,
    flex: 1,
    gap: spacing.sm,
    minHeight: 84,
    padding: spacing.md,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
  },
});
