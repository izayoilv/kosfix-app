import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { formatDateTime } from '../domain/formatting';
import { STATUS_LABELS } from '../domain/labels';
import type { RepairEvent } from '../domain/types';
import { spacing } from '../theme/tokens';

function eventLabel(event: RepairEvent): string {
  if (event.type === 'created') {
    return 'Dibuat';
  }

  if (event.type === 'status_changed' && event.fromStatus !== null && event.toStatus !== null) {
    return `${STATUS_LABELS[event.fromStatus]} → ${STATUS_LABELS[event.toStatus]}`;
  }

  return event.note ?? 'Biaya dicatat';
}

export function RepairTimeline({ events }: { events: RepairEvent[] }) {
  const theme = useTheme();
  const ordered = [...events].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <View style={styles.list}>
      {ordered.map((event) => (
        <View key={event.id} style={styles.row}>
          <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
          <View style={styles.body}>
            <Text style={[styles.label, { color: theme.colors.onSurface }]}>
              {eventLabel(event)}
            </Text>
            <Text style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>
              {formatDateTime(event.createdAt)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  dot: {
    borderRadius: 999,
    height: 8,
    marginTop: 6,
    width: 8,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  date: {
    fontSize: 11,
  },
});
