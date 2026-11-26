import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  Button,
  Chip,
  Snackbar,
  Switch,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { useServices } from '../shell/ServicesProvider';
import type { RootStackParamList } from '../shell/RootNavigator';
import { EmptyState } from '../components/EmptyState';
import { PhotoField } from '../components/PhotoField';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { useItem } from '../data/hooks';
import { formatDate, formatDateTime, localDateKey, parseRupiahInput } from '../domain/formatting';
import { CATEGORY_LABELS, LOCATION_LABELS, PRIORITY_LABELS } from '../domain/labels';
import type {
  Category,
  ItemFormValues,
  Location,
  NewItem,
  Priority,
  ValidationErrors,
} from '../domain/types';
import { validateItemForm } from '../domain/validation';

type FormRoute = RouteProp<RootStackParamList, 'ItemForm'>;
type FormNavigation = NativeStackNavigationProp<RootStackParamList>;

const DEFAULT_VALUES: ItemFormValues = {
  name: '',
  category: 'elektronik',
  location: 'kamar',
  priority: 'sedang',
  notes: '',
  estimatedCost: '',
  actualCost: '',
  targetDate: null,
  reminderEnabled: false,
  reminderAt: null,
  photoPath: null,
};

const CATEGORY_VALUES: Category[] = [
  'elektronik',
  'furnitur',
  'kamar_mandi',
  'bangunan',
  'lainnya',
];
const LOCATION_VALUES: Location[] = ['kamar', 'kamar_mandi', 'dapur', 'area_umum'];
const PRIORITY_VALUES: Priority[] = ['rendah', 'sedang', 'tinggi'];

function nextDateKey(now: Date): string {
  const date = new Date(now);
  date.setDate(date.getDate() + 1);
  return localDateKey(date);
}

function reminderAtNine(dateKey: string): string {
  return new Date(`${dateKey}T09:00:00+07:00`).toISOString();
}

function costValue(input: string): number | null {
  const parsed = parseRupiahInput(input);
  return parsed === null || Number.isNaN(parsed) ? null : parsed;
}

function FieldError({ message }: { message: string | undefined }) {
  const theme = useTheme();

  if (message === undefined) {
    return null;
  }

  return <Text style={{ color: theme.colors.error, fontSize: 12 }}>{message}</Text>;
}

export function ItemFormScreen() {
  const route = useRoute<FormRoute>();
  const navigation = useNavigation<FormNavigation>();
  const theme = useTheme();
  const services = useServices();
  const editingId = route.params?.itemId;
  const { data: existing, loading } = useItem(editingId ?? '__new__');
  const now = services.now();
  const [values, setValues] = useState<ItemFormValues>(DEFAULT_VALUES);
  const [initialized, setInitialized] = useState(editingId === undefined);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [pendingPhotoUri, setPendingPhotoUri] = useState<string | null>(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);
  const [targetPickerVisible, setTargetPickerVisible] = useState(false);
  const [reminderPickerVisible, setReminderPickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState('');

  useEffect(() => {
    if (existing === null || initialized) {
      return;
    }

    const expired =
      existing.reminderAt !== null && new Date(existing.reminderAt).getTime() <= now.getTime();

    // Editing seeds a local draft exactly once, when the repository row arrives.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValues({
      name: existing.name,
      category: existing.category,
      location: existing.location,
      priority: existing.priority,
      notes: existing.notes,
      estimatedCost: existing.estimatedCost === null ? '' : String(existing.estimatedCost),
      actualCost: existing.actualCost === null ? '' : String(existing.actualCost),
      targetDate: existing.targetDate,
      reminderEnabled: existing.reminderAt !== null && !expired,
      reminderAt: existing.reminderAt,
      photoPath: existing.photoPath,
    });
    setInitialized(true);
  }, [existing, initialized, now]);

  useEffect(() => {
    let active = true;

    void services.photos.restorePendingPickerResult().then((uri) => {
      if (active && uri !== null) {
        setPendingPhotoUri(uri);
      }
    });

    return () => {
      active = false;
    };
  }, [services.photos]);

  const update = <K extends keyof ItemFormValues>(key: K, value: ItemFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const pickPhoto = async (source: 'camera' | 'library') => {
    const uri =
      source === 'camera'
        ? await services.photos.pickFromCamera()
        : await services.photos.pickFromLibrary();

    if (uri !== null) {
      setPendingPhotoUri(uri);
      setPhotoRemoved(false);
    }
  };

  const removePhoto = () => {
    setPendingPhotoUri(null);
    setPhotoRemoved(true);
    update('photoPath', null);
  };

  const toggleReminder = async (enabled: boolean) => {
    if (!enabled) {
      setValues((current) => ({ ...current, reminderEnabled: false, reminderAt: null }));
      return;
    }

    const permission = await services.notifications.requestPermission();

    if (!permission.granted) {
      setValues((current) => ({ ...current, reminderEnabled: false, reminderAt: null }));
      setErrors((current) => ({ ...current, reminderAt: 'Izin pengingat tidak aktif' }));
      return;
    }

    setErrors((current) => ({ ...current, reminderAt: undefined }));
    setValues((current) => ({
      ...current,
      reminderEnabled: true,
      reminderAt: reminderAtNine(
        current.targetDate !== null && current.targetDate >= localDateKey(now)
          ? current.targetDate
          : nextDateKey(now),
      ),
    }));
  };

  const handleSave = async () => {
    const validation = validateItemForm(values, now);
    setErrors(validation);

    if (Object.keys(validation).length > 0) {
      return;
    }

    setSaving(true);
    let navigationMessage: string | undefined;

    const input: NewItem = {
      name: values.name.trim(),
      category: values.category,
      location: values.location,
      priority: values.priority,
      notes: values.notes.trim(),
      photoPath: values.photoPath,
      estimatedCost: costValue(values.estimatedCost),
      actualCost: costValue(values.actualCost),
      targetDate: values.targetDate,
      reminderAt: values.reminderEnabled ? values.reminderAt : null,
    };

    try {
      let saved =
        existing === null
          ? await services.repository.create(input)
          : await services.repository.update(existing.id, input);

      if (pendingPhotoUri !== null) {
        try {
          const path = await services.photos.save(pendingPhotoUri, saved.id);
          saved = await services.repository.update(saved.id, { ...input, photoPath: path });

          if (existing?.photoPath !== null && existing?.photoPath !== undefined) {
            await services.photos.remove(existing.photoPath);
          }
        } catch {
          navigationMessage = 'Foto gagal disimpan';
        }
      } else if (
        photoRemoved &&
        existing?.photoPath !== null &&
        existing?.photoPath !== undefined
      ) {
        await services.photos.remove(existing.photoPath);
      }

      if (existing !== null) {
        await services.notifications.cancel(existing.reminderNotificationId);
      }

      if (values.reminderEnabled && values.reminderAt !== null) {
        const result = await services.notifications.schedule(saved);

        if (result.ok) {
          await services.repository.setReminder(saved.id, values.reminderAt, result.id);
        } else {
          await services.repository.setReminder(saved.id, null, null);
          navigationMessage = 'Pengingat gagal dijadwalkan';
        }
      } else {
        await services.repository.setReminder(saved.id, null, null);
      }

      if (existing === null) {
        navigation.replace('ItemDetail', { itemId: saved.id, message: navigationMessage });
      } else if (navigationMessage === undefined && navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('ItemDetail', { itemId: saved.id, message: navigationMessage });
      }
    } catch {
      setSnackbar('Gagal menyimpan. Coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !initialized) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={{ color: theme.colors.onSurfaceVariant }}>Memuat data...</Text>
        </View>
      </Screen>
    );
  }

  if (editingId !== undefined && !loading && existing === null) {
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

  const previewPath = pendingPhotoUri ?? values.photoPath;
  const previewUri = (path: string | null) =>
    path !== null && path.startsWith('file:') ? path : services.photos.resolve(path);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text variant="headlineSmall" style={styles.title}>
          {editingId === undefined ? 'Tambah Barang' : 'Ubah Barang'}
        </Text>

        <PhotoField
          photoPath={previewPath}
          resolvePhoto={previewUri}
          onPickCamera={() => void pickPhoto('camera')}
          onPickLibrary={() => void pickPhoto('library')}
          onRemove={removePhoto}
        />

        <View style={styles.section}>
          <SectionHeader title="Informasi barang" />
          <TextInput
            label="Nama barang"
            accessibilityLabel="Nama barang"
            value={values.name}
            onChangeText={(text) => update('name', text)}
            error={errors.name !== undefined}
          />
          <FieldError message={errors.name} />

          <Text style={styles.label}>Kategori</Text>
          <View style={styles.chips}>
            {CATEGORY_VALUES.map((category) => (
              <Chip
                key={category}
                selected={values.category === category}
                accessibilityRole="button"
                accessibilityLabel={`Kategori ${CATEGORY_LABELS[category]}`}
                onPress={() => update('category', category)}
              >
                {CATEGORY_LABELS[category]}
              </Chip>
            ))}
          </View>

          <Text style={styles.label}>Lokasi</Text>
          <View style={styles.chips}>
            {LOCATION_VALUES.map((location) => (
              <Chip
                key={location}
                selected={values.location === location}
                accessibilityRole="button"
                accessibilityLabel={`Lokasi ${LOCATION_LABELS[location]}`}
                onPress={() => update('location', location)}
              >
                {LOCATION_LABELS[location]}
              </Chip>
            ))}
          </View>

          <Text style={styles.label}>Prioritas</Text>
          <View style={styles.chips}>
            {PRIORITY_VALUES.map((priority) => (
              <Chip
                key={priority}
                selected={values.priority === priority}
                accessibilityRole="button"
                accessibilityLabel={`Prioritas ${PRIORITY_LABELS[priority]}`}
                onPress={() => update('priority', priority)}
              >
                {PRIORITY_LABELS[priority]}
              </Chip>
            ))}
          </View>

          <TextInput
            label="Catatan"
            accessibilityLabel="Catatan"
            value={values.notes}
            onChangeText={(text) => update('notes', text)}
            multiline
            numberOfLines={3}
            error={errors.notes !== undefined}
          />
          <FieldError message={errors.notes} />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Biaya dan jadwal" />
          <TextInput
            label="Estimasi biaya"
            accessibilityLabel="Estimasi biaya"
            value={values.estimatedCost}
            onChangeText={(text) => update('estimatedCost', text)}
            keyboardType="numeric"
            error={errors.estimatedCost !== undefined}
          />
          <FieldError message={errors.estimatedCost} />

          <TextInput
            label="Biaya aktual"
            accessibilityLabel="Biaya aktual"
            value={values.actualCost}
            onChangeText={(text) => update('actualCost', text)}
            keyboardType="numeric"
            error={errors.actualCost !== undefined}
          />
          <FieldError message={errors.actualCost} />

          <View style={styles.inlineRow}>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              Target: {formatDate(values.targetDate)}
            </Text>
            <Button compact onPress={() => setTargetPickerVisible(true)}>
              Pilih tanggal
            </Button>
          </View>
          {targetPickerVisible ? (
            <DateTimePicker
              testID="target-picker"
              value={
                values.targetDate === null ? now : new Date(`${values.targetDate}T09:00:00+07:00`)
              }
              mode="date"
              onChange={(event, date) => {
                setTargetPickerVisible(false);
                if (event.type === 'set' && date !== undefined) {
                  update('targetDate', localDateKey(date));
                }
              }}
            />
          ) : null}

          <View style={styles.inlineRow}>
            <View style={styles.reminderLabel}>
              <Text style={{ color: theme.colors.onSurface }}>Ingatkan saya</Text>
              {values.reminderEnabled && values.reminderAt !== null ? (
                <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>
                  {formatDateTime(values.reminderAt)}
                </Text>
              ) : null}
              <FieldError message={errors.reminderAt} />
            </View>
            <Switch
              accessibilityLabel="Aktifkan pengingat"
              value={values.reminderEnabled}
              onValueChange={(value) => void toggleReminder(value)}
            />
          </View>
          {values.reminderEnabled ? (
            <Button compact onPress={() => setReminderPickerVisible(true)}>
              Pilih waktu
            </Button>
          ) : null}
          {reminderPickerVisible && values.reminderAt !== null ? (
            <DateTimePicker
              testID="reminder-picker"
              value={new Date(values.reminderAt)}
              mode="date"
              onChange={(event, date) => {
                setReminderPickerVisible(false);
                if (event.type === 'set' && date !== undefined) {
                  update('reminderAt', reminderAtNine(localDateKey(date)));
                }
              }}
            />
          ) : null}
        </View>

        <Button
          mode="contained"
          onPress={() => void handleSave()}
          loading={saving}
          disabled={saving}
        >
          Simpan
        </Button>
      </ScrollView>

      <Snackbar visible={snackbar.length > 0} onDismiss={() => setSnackbar('')} duration={4000}>
        {snackbar}
      </Snackbar>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontWeight: '700',
  },
  section: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  inlineRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reminderLabel: {
    flex: 1,
    gap: 2,
  },
  center: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
  },
});
