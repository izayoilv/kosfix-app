import { Image, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Text, useTheme } from 'react-native-paper';
import { radius, spacing } from '../theme/tokens';

type PhotoFieldProps = {
  photoPath: string | null;
  resolvePhoto: (path: string | null) => string | null;
  onPickCamera: () => void;
  onPickLibrary: () => void;
  onRemove: () => void;
  readOnly?: boolean;
};

export function PhotoField({
  photoPath,
  resolvePhoto,
  onPickCamera,
  onPickLibrary,
  onRemove,
  readOnly = false,
}: PhotoFieldProps) {
  const theme = useTheme();
  const photoUri = resolvePhoto(photoPath);

  return (
    <View style={styles.container}>
      <View style={[styles.frame, { backgroundColor: theme.colors.surfaceVariant }]}>
        {photoUri === null ? (
          <View style={styles.placeholder}>
            <MaterialCommunityIcons
              name="camera-outline"
              size={28}
              color={theme.colors.onSurfaceVariant}
            />
            <Text style={{ color: theme.colors.onSurfaceVariant }}>Belum ada foto</Text>
          </View>
        ) : (
          <Image
            source={{ uri: photoUri }}
            style={styles.photo}
            accessible
            accessibilityLabel="Foto barang"
          />
        )}
      </View>

      {readOnly ? null : (
        <View style={styles.actions}>
          {photoUri === null ? (
            <>
              <Button compact onPress={onPickCamera}>
                Kamera
              </Button>
              <Button compact onPress={onPickLibrary}>
                Galeri
              </Button>
            </>
          ) : (
            <>
              <Button compact onPress={onPickCamera}>
                Ganti foto
              </Button>
              <Button compact onPress={onRemove} textColor={theme.colors.error}>
                Hapus foto
              </Button>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  frame: {
    aspectRatio: 4 / 3,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  placeholder: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
    justifyContent: 'center',
  },
  photo: {
    height: '100%',
    width: '100%',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
