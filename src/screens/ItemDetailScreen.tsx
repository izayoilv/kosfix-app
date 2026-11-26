import { useCallback, useState } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  Button,
  Dialog,
  Portal,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { useFeedback } from '../shell/FeedbackProvider';
import { useServices } from '../shell/ServicesProvider';
import type { RootStackParamList } from '../shell/RootNavigator';
import { EmptyState } from '../components/EmptyState';
import { MoneyText } from '../components/MoneyText';
import { OverdueLabel } from '../components/OverdueLabel';
import { PhotoField } from '../components/PhotoField';
import { PriorityBadge } from '../components/PriorityBadge';
import { RepairTimeline } from '../components/RepairTimeline';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { StatusBadge } from '../components/StatusBadge';
import { useItem, useItemEvents } from '../data/hooks';
import { formatDate, formatDateTime, localDateKey, parseRupiahInput } from '../domain/formatting';
import { costInputError } from '../domain/validation';
import { CATEGORY_LABELS, LOCATION_LABELS } from '../domain/labels';
import { isOverdue } from '../domain/overdue';
import { isReminderExpired } from '../domain/reminder';
import type { Item } from '../domain/types';

type DetailRoute = RouteProp<RootStackParamList, 'ItemDetail'>;
type DetailNavigation = NativeStackNavigationProp<RootStackParamList>;

const PRIMARY_LABELS: Record<Item['status'], string> = {
  rusak: 'Mulai perbaikan',
  dikerjakan: 'Tandai selesai',
  selesai: 'Buka kembali',
};

export function ItemDetailScreen() {
  const route = useRoute<DetailRoute>();
  const navigation = useNavigation<DetailNavigation>();
  const theme = useTheme();
  const services = useServices();
  const { data: item, loading, error, reload } = useItem(route.params.itemId);
  const { data: events, reload: reloadEvents } = useItemEvents(route.params.itemId);
  const now = services.now();
  const today = localDateKey(now);
  const [completeVisible, setCompleteVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [actualCostInput, setActualCostInput] = useState('');
  const [completeError, setCompleteError] = useState<string | undefined>(undefined);
  const [permissionGranted, setPermissionGranted] = useState(true);
  const { showMessage } = useFeedback();

  const reminderExpired = item !== null && isReminderExpired(item, now);
  const hasFutureReminder =
    item?.reminderAt !== null && item?.reminderAt !== undefined && !reminderExpired;

  useFocusEffect(
    useCallback(() => {
      let active = true;

      if (!hasFutureReminder) {
        setPermissionGranted(true);
        return () => {
          active = false;
        };
      }

      void services.notifications
        .getPermission()
        .then((result) => {
          if (active) {
            setPermissionGranted(result.granted);
          }
        })
        .catch(() => {
          if (active) {
            setPermissionGranted(false);
          }
        });

      return () => {
        active = false;
      };
    }, [hasFutureReminder, services.notifications]),
  );

  const reloadAll = () => {
    reload();
    reloadEvents();
  };

  const applyStatus = async (next: 'dikerjakan' | 'selesai', actualCost?: number | null) => {
    if (item === null) return;

    try {
      if (next === 'selesai' && item.reminderNotificationId !== null) {
        await services.notifications.cancel(item.reminderNotificationId);
      }

      await services.repository.changeStatus(item.id, next, { actualCost });
      reloadAll();
      showMessage('Status diperbarui.');
    } catch {
      showMessage('Gagal memperbarui status. Coba lagi.');
    }
  };

  const handlePrimaryAction = () => {
    if (item === null) return;

    if (item.status === 'rusak') {
      void applyStatus('dikerjakan');
      return;
    }

    if (item.status === 'dikerjakan') {
      setActualCostInput(item.actualCost === null ? '' : String(item.actualCost));
      setCompleteError(undefined);
      setCompleteVisible(true);
      return;
    }

    void applyStatus('dikerjakan');
  };

  const handleComplete = () => {
    const trimmed = actualCostInput.trim();
    const error = trimmed.length === 0 ? undefined : costInputError('Biaya aktual', trimmed);

    if (error !== undefined) {
      setCompleteError(error);
      return;
    }

    const parsed = trimmed.length === 0 ? null : parseRupiahInput(trimmed);
    const actualCost = parsed === null ? undefined : parsed;
    setCompleteError(undefined);
    setCompleteVisible(false);
    void applyStatus('selesai', actualCost);
  };

  const handleDelete = () => {
    if (item === null) return;
    setDeleteVisible(false);

    void (async () => {
      try {
        await services.notifications.cancel(item.reminderNotificationId);
        await services.repository.remove(item.id);

        try {
          await services.photos.remove(item.photoPath);
        } catch {
          // The row is already gone; an orphaned photo is acceptable for v1.
        }

        showMessage('Barang dihapus.');
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
      } catch {
        showMessage('Gagal menghapus. Coba lagi.');
      }
    })();
  };

  if (loading && item === null) {
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
          actionLabel="Coba lagi"
          onAction={reloadAll}
        />
      </Screen>
    );
  }

  if (item === null) {
    return (
      <Screen>
        <EmptyState
          icon="package-variant-closed"
          title="Barang tidak ditemukan"
          body="Barang ini mungkin sudah dihapus."
          actionLabel="Kembali"
          onAction={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            }
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <Text variant="headlineSmall" style={styles.title}>
            {item.name}
          </Text>
          <Button compact onPress={() => navigation.navigate('ItemForm', { itemId: item.id })}>
            Ubah
          </Button>
          <Button compact textColor={theme.colors.error} onPress={() => setDeleteVisible(true)}>
            Hapus
          </Button>
        </View>

        <PhotoField
          photoPath={item.photoPath}
          resolvePhoto={services.photos.resolve}
          onPickCamera={() => undefined}
          onPickLibrary={() => undefined}
          onRemove={() => undefined}
          readOnly
        />

        <View style={styles.badges}>
          <PriorityBadge priority={item.priority} />
          <StatusBadge status={item.status} />
          <OverdueLabel visible={isOverdue(item, today)} />
        </View>

        <View style={styles.meta}>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>
            {CATEGORY_LABELS[item.category]} · {LOCATION_LABELS[item.location]}
          </Text>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>
            Target: {formatDate(item.targetDate)}
          </Text>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>
            Dibuat: {formatDate(item.createdAt)}
          </Text>
          {item.reminderAt === null ? null : reminderExpired ? (
            <Text style={{ color: theme.colors.error }}>Pengingat sudah lewat</Text>
          ) : (
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              Pengingat: {formatDateTime(item.reminderAt)}
            </Text>
          )}
          {hasFutureReminder && !permissionGranted ? (
            <View style={styles.permissionRow}>
              <Text style={{ color: theme.colors.error }}>Izin pengingat tidak aktif</Text>
              <Button compact onPress={() => void Linking.openSettings()}>
                Buka pengaturan
              </Button>
            </View>
          ) : null}
        </View>

        <View style={[styles.costCard, { backgroundColor: theme.colors.surfaceVariant }]}>
          <View style={styles.costRow}>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>Estimasi</Text>
            <MoneyText value={item.estimatedCost} />
          </View>
          <View style={styles.costRow}>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>Aktual</Text>
            <MoneyText value={item.actualCost} />
          </View>
        </View>

        {item.notes.trim().length === 0 ? null : (
          <View style={styles.section}>
            <SectionHeader title="Catatan" />
            <Text style={{ color: theme.colors.onSurface }}>{item.notes}</Text>
          </View>
        )}

        <View style={styles.section}>
          <SectionHeader title="Riwayat" />
          <RepairTimeline events={events} />
        </View>

        <Button mode="contained" onPress={handlePrimaryAction} style={styles.primary}>
          {PRIMARY_LABELS[item.status]}
        </Button>
      </ScrollView>

      <Portal>
        <Dialog visible={completeVisible} onDismiss={() => setCompleteVisible(false)}>
          <Dialog.Title>Tandai selesai</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Biaya aktual"
              accessibilityLabel="Biaya aktual"
              value={actualCostInput}
              onChangeText={(text) => {
                setActualCostInput(text);
                setCompleteError(undefined);
              }}
              keyboardType="numeric"
              error={completeError !== undefined}
            />
            {completeError === undefined ? null : (
              <Text style={{ color: theme.colors.error, fontSize: 12 }}>{completeError}</Text>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCompleteVisible(false)}>Batal</Button>
            <Button testID="confirm-complete" onPress={handleComplete}>
              Tandai selesai
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={deleteVisible} onDismiss={() => setDeleteVisible(false)}>
          <Dialog.Title>Hapus barang?</Dialog.Title>
          <Dialog.Content>
            <Text>Foto dan pengingat barang ini juga akan dihapus.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteVisible(false)}>Batal</Button>
            <Button testID="confirm-delete" textColor={theme.colors.error} onPress={handleDelete}>
              Hapus
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    padding: 16,
    paddingBottom: 40,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  title: {
    flex: 1,
    fontWeight: '700',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  permissionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  meta: {
    gap: 4,
  },
  costCard: {
    borderRadius: 12,
    gap: 8,
    padding: 12,
  },
  costRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  section: {
    gap: 8,
  },
  primary: {
    marginTop: 8,
  },
  center: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
  },
});
