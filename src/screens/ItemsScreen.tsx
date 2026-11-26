import { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  Button,
  Chip,
  FAB,
  Searchbar,
  Text,
  useTheme,
} from 'react-native-paper';
import { useServices } from '../shell/ServicesProvider';
import type { RootStackParamList, TabParamList } from '../shell/RootNavigator';
import { EmptyState } from '../components/EmptyState';
import { ItemCard } from '../components/ItemCard';
import { Screen } from '../components/Screen';
import { CATEGORY_LABELS } from '../domain/labels';
import { localDateKey } from '../domain/formatting';
import { filterItems, sortItems } from '../domain/filters';
import type { SortKey } from '../domain/filters';
import type { Category, ItemStatus } from '../domain/types';
import { useItems } from '../data/hooks';

type ItemsNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Barang'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const STATUS_OPTIONS: { value: ItemStatus | 'semua'; label: string }[] = [
  { value: 'semua', label: 'Semua' },
  { value: 'rusak', label: 'Rusak' },
  { value: 'dikerjakan', label: 'Dikerjakan' },
  { value: 'selesai', label: 'Selesai' },
];

const CATEGORY_OPTIONS: { value: Category | 'semua'; label: string }[] = [
  { value: 'semua', label: 'Semua kategori' },
  { value: 'elektronik', label: 'Elektronik' },
  { value: 'furnitur', label: 'Furnitur' },
  { value: 'kamar_mandi', label: 'Kamar mandi' },
  { value: 'bangunan', label: 'Bangunan' },
  { value: 'lainnya', label: 'Lainnya' },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'priority', label: 'Prioritas' },
  { value: 'newest', label: 'Terbaru' },
  { value: 'target', label: 'Target terdekat' },
];

const SORT_LABELS: Record<SortKey, string> = {
  priority: 'Prioritas',
  newest: 'Terbaru',
  target: 'Target terdekat',
};

export function ItemsScreen() {
  const navigation = useNavigation<ItemsNavigation>();
  const theme = useTheme();
  const services = useServices();
  const { data: items, loading } = useItems();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<ItemStatus | 'semua'>('semua');
  const [category, setCategory] = useState<Category | 'semua'>('semua');
  const [sort, setSort] = useState<SortKey>('priority');

  const today = localDateKey(services.now());
  const visibleItems = useMemo(
    () => sortItems(filterItems(items, { query, status, category }), sort),
    [category, items, query, sort, status],
  );

  const counts = useMemo(
    () => ({
      semua: items.length,
      rusak: items.filter((item) => item.status === 'rusak').length,
      dikerjakan: items.filter((item) => item.status === 'dikerjakan').length,
      selesai: items.filter((item) => item.status === 'selesai').length,
    }),
    [items],
  );

  const resetFilters = () => {
    setQuery('');
    setStatus('semua');
    setCategory('semua');
    setSort('priority');
  };

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

  if (items.length === 0) {
    return (
      <Screen>
        <EmptyState
          icon="package-variant-closed"
          title="Belum ada barang"
          body="Catat barang rusak pertama di kosmu."
          actionLabel="Tambah barang"
          onAction={() => navigation.navigate('ItemForm', {})}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.shell}>
        <View style={styles.header}>
          <Text variant="headlineSmall">Daftar Barang</Text>
          <Searchbar
            placeholder="Cari nama atau catatan..."
            value={query}
            onChangeText={setQuery}
            accessibilityLabel="Cari barang"
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            {STATUS_OPTIONS.map((option) => (
              <Chip
                key={option.value}
                selected={status === option.value}
                onPress={() => setStatus(option.value)}
                accessibilityRole="button"
                accessibilityLabel={option.label}
              >
                {option.label} {counts[option.value]}
              </Chip>
            ))}
          </ScrollView>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            {CATEGORY_OPTIONS.map((option) => (
              <Chip
                key={option.value}
                selected={category === option.value}
                onPress={() => setCategory(option.value)}
                accessibilityRole="button"
                accessibilityLabel={`Kategori ${option.label}`}
              >
                {option.label}
              </Chip>
            ))}
          </ScrollView>
          <View style={styles.filterRow}>
            <Button
              mode="outlined"
              icon="sort"
              accessibilityLabel={`Urutkan: ${SORT_LABELS[sort]}`}
              onPress={() => {
                const index = SORT_OPTIONS.findIndex((option) => option.value === sort);
                setSort(SORT_OPTIONS[(index + 1) % SORT_OPTIONS.length].value);
              }}
            >
              Urutkan: {SORT_LABELS[sort]}
            </Button>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              {category === 'semua' ? 'Semua kategori' : CATEGORY_LABELS[category]}
            </Text>
          </View>
        </View>
        <FlatList
          data={visibleItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ItemCard
              item={item}
              today={today}
              resolvePhoto={services.photos.resolve}
              onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <EmptyState
              icon="filter-off-outline"
              title="Tidak ada barang yang cocok"
              body="Coba ubah kata kunci atau filter."
              actionLabel="Reset filter"
              onAction={resetFilters}
            />
          }
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
        <FAB
          icon="plus"
          accessibilityLabel="Tambah barang"
          onPress={() => navigation.navigate('ItemForm', {})}
          style={styles.fab}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  header: {
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  chips: {
    gap: 6,
    paddingRight: 8,
  },
  filterRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },

  listContent: {
    paddingBottom: 96,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  separator: {
    height: 12,
  },
  fab: {
    bottom: 16,
    position: 'absolute',
    right: 16,
  },
  center: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
  },
});
