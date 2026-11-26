import * as ImagePicker from 'expo-image-picker';
import { Directory, File, Paths } from 'expo-file-system';
import type { PhotoStore } from './types';

const PHOTO_DIRECTORY = 'photos';

async function launchPicker(source: 'camera' | 'library'): Promise<string | null> {
  if (source === 'camera') {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      throw new Error('photo-permission');
    }
  }

  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.7,
  };

  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

  if (result.canceled || result.assets.length === 0) {
    return null;
  }

  return result.assets[0]?.uri ?? null;
}

export function createExpoPhotoService(): PhotoStore {
  async function pickFromCamera(): Promise<string | null> {
    return launchPicker('camera');
  }

  async function pickFromLibrary(): Promise<string | null> {
    return launchPicker('library');
  }

  async function restorePendingPickerResult(): Promise<string | null> {
    const result = await ImagePicker.getPendingResultAsync();

    if (result === null || !('assets' in result) || result.assets === null) {
      return null;
    }

    return result.assets?.[0]?.uri ?? null;
  }

  async function save(tempUri: string, itemId: string): Promise<string> {
    const directory = new Directory(Paths.document, PHOTO_DIRECTORY);

    if (!directory.exists) {
      directory.create({ intermediates: true });
    }

    const destination = new File(directory, `${itemId}.jpg`);
    await new File(tempUri).copy(destination, { overwrite: true });

    return `${PHOTO_DIRECTORY}/${itemId}.jpg`;
  }

  async function remove(path: string | null): Promise<void> {
    if (path === null) {
      return;
    }

    const file = new File(Paths.document, path);

    if (file.exists) {
      file.delete();
    }
  }

  function resolve(path: string | null): string | null {
    return path === null ? null : new File(Paths.document, path).uri;
  }

  return {
    pickFromCamera,
    pickFromLibrary,
    restorePendingPickerResult,
    save,
    remove,
    resolve,
  };
}
