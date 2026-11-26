import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';
import { EmptyState } from '../components/EmptyState';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { useItems } from '../data/hooks';
import { formatRupiah } from '../domain/formatting';
import { CATEGORY_LABELS } from '../domain/labels';
import { computeStats } from '../domain/stats';

export function StatsScreen() {
  const theme = useTheme();
  const { data: items, loading, error, reload } = useItems();
  const stats = computeStats(items);
  const maxCategoryCount = Math.max(1, ...stats.categories.map((entry) => entry.count));

  if (loading && items.length === 0) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={{ color: theme.colors.onSurfaceVariant }}>Memuat data...</Text>
        </View>
      </Screen>
    );
  }

  if (error !== null && items.length === 0) {
    return (
      <Screen>
        <EmptyState
          icon="alert-circle-outline"
          title="Data gagal dimuat"
          body="Coba muat ulang statistik."
          actionLabel="Coba lagi"
          onAction={reload}
        />
      </Screen>
    );
  }

  if (items.length === 0) {
    return (
      <Screen>
        <EmptyState
          icon="chart-bar"
          title="Belum ada data untuk dihitung"
          body="Tambahkan barang agar statistik mulai terisi."
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text variant="headlineSmall">Statistik</Text>
        <Text testID="total-count" style={[styles.total, { color: theme.colors.onSurface }]}>
          Total {stats.total} barang
        </Text>

        <View style={[styles.panel, { backgroundColor: theme.colors.surface }]}>
          <SectionHeader title="Status" />
          {[
            ['rusak', stats.rusak],
            ['dikerjakan', stats.dikerjakan],
            ['selesai', stats.selesai],
          ].map(([status, count]) => (
            <View key={status} style={styles.row}>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>
                {status === 'rusak' ? 'Rusak' : status === 'dikerjakan' ? 'Dikerjakan' : 'Selesai'}
              </Text>
              <Text testID={`status-count-${status}`} style={styles.value}>
                {count}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.panel, { backgroundColor: theme.colors.surface }]}>
          <SectionHeader title="Biaya" />
          <View style={styles.row}>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>Estimasi</Text>
            <Text testID="estimated-total" style={styles.value}>
              {formatRupiah(stats.estimatedTotal)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>Aktual</Text>
            <Text testID="actual-total" style={styles.value}>
              {formatRupiah(stats.actualTotal)}
            </Text>
          </View>
        </View>

        <View style={[styles.panel, { backgroundColor: theme.colors.surface }]}>
          <SectionHeader title="Berdasarkan kategori" />
          {stats.categories.map((entry) => (
            <View
              key={entry.category}
              testID="category-row"
              accessible
              accessibilityLabel={`${CATEGORY_LABELS[entry.category]}, ${entry.count} barang`}
              style={styles.categoryRow}
            >
              <View style={styles.categoryHeader}>
                <Text style={{ color: theme.colors.onSurface }}>
                  {CATEGORY_LABELS[entry.category]}
                </Text>
                <Text style={styles.value}>{entry.count}</Text>
              </View>
              <View style={[styles.track, { backgroundColor: theme.colors.surfaceVariant }]}>
                <View
                  style={[
                    styles.bar,
                    {
                      backgroundColor: theme.colors.primary,
                      width: `${(entry.count / maxCategoryCount) * 100}%`,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    padding: 16,
    paddingBottom: 32,
  },
  total: {
    fontSize: 14,
    fontWeight: '600',
  },
  panel: {
    borderRadius: 12,
    gap: 10,
    padding: 16,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  value: {
    fontWeight: '700',
  },
  categoryRow: {
    gap: 6,
  },
  categoryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  track: {
    borderRadius: 999,
    height: 8,
    overflow: 'hidden',
  },
  bar: {
    borderRadius: 999,
    height: 8,
  },
  center: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
  },
});
