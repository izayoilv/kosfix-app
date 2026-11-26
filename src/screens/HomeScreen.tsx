import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, Button, Text, useTheme } from 'react-native-paper';
import { useServices } from '../app/ServicesProvider';
import type { RootStackParamList, TabParamList } from '../app/RootNavigator';
import { EmptyState } from '../components/EmptyState';
import { ItemCard } from '../components/ItemCard';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { StatTile } from '../components/StatTile';
import { formatRelativeTime, formatRupiah, localDateKey } from '../domain/formatting';
import { isUrgent } from '../domain/overdue';
import { sortItems } from '../domain/filters';
import { computeStats } from '../domain/stats';
import { useItems, useRecentEvents } from '../data/hooks';

type HomeNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Beranda'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function HomeScreen() {
  const navigation = useNavigation<HomeNavigation>();
  const theme = useTheme();
  const services = useServices();
  const { data: items, loading, error } = useItems();
  const { data: recentEvents } = useRecentEvents(3);
  const now = services.now();
  const today = localDateKey(now);
  const stats = computeStats(items);
  const urgent = sortItems(
    items.filter((item) => isUrgent(item, today)),
    'priority',
  ).slice(0, 3);
  const openForm = () => navigation.navigate('ItemForm', {});

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

  if (error !== null) {
    return (
      <Screen>
        <EmptyState
          icon="alert-circle-outline"
          title="Data gagal dimuat"
          body="Coba muat ulang halaman ini."
        />
      </Screen>
    );
  }

  if (items.length === 0) {
    return (
      <Screen>
        <EmptyState
          icon="package-variant-closed"
          title="Belum ada barang"
          body="Catat barang rusak pertama di kosmu."
          actionLabel="Tambah barang"
          onAction={openForm}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View>
          <Text variant="displaySmall" style={styles.wordmark}>
            KosFix
          </Text>
          <Text style={[styles.greeting, { color: theme.colors.onSurface }]}>Halo!</Text>
          <Text style={[styles.subheading, { color: theme.colors.onSurfaceVariant }]}>
            Pantau barang rusak di kosmu.
          </Text>
        </View>

        <View style={styles.tileRow}>
          <StatTile label="Rusak" value={String(stats.rusak)} unit="barang" icon="alert-outline" />
          <StatTile
            label="Dikerjakan"
            value={String(stats.dikerjakan)}
            unit="barang"
            icon="progress-wrench"
          />
        </View>
        <View style={styles.tileRow}>
          <StatTile
            label="Selesai"
            value={String(stats.selesai)}
            unit="barang"
            icon="check-circle-outline"
          />
          <StatTile
            label="Estimasi biaya"
            value={formatRupiah(stats.estimatedTotal)}
            icon="cash-multiple"
          />
        </View>

        <SectionHeader title="Perlu segera" />
        {urgent.length === 0 ? (
          <Text style={{ color: theme.colors.onSurfaceVariant }}>Tidak ada barang mendesak.</Text>
        ) : (
          <View style={styles.cards}>
            {urgent.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                today={today}
                variant="urgent"
                resolvePhoto={services.photos.resolve}
                onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
              />
            ))}
          </View>
        )}

        <SectionHeader title="Aktivitas terbaru" />
        <View style={styles.activity}>
          {recentEvents.map((event) => (
            <View key={event.id} style={styles.activityRow}>
              <Text style={[styles.activityName, { color: theme.colors.onSurface }]}>
                {event.itemName}
              </Text>
              <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>
                {formatRelativeTime(event.createdAt, now)}
              </Text>
            </View>
          ))}
        </View>

        <Button mode="contained" onPress={openForm} style={styles.addButton}>
          Tambah barang
        </Button>
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
  wordmark: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
  },
  subheading: {
    fontSize: 13,
    marginTop: 2,
  },
  tileRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cards: {
    gap: 12,
  },
  activity: {
    gap: 10,
  },
  activityRow: {
    gap: 2,
  },
  activityName: {
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    marginTop: 8,
  },
  center: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
  },
});
