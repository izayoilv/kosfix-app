jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  getPendingResultAsync: jest.fn(),
}));

jest.mock('expo-file-system', () => {
  const create = jest.fn();
  const copy = jest.fn();
  const remove = jest.fn();

  class MockDirectory {
    uri: string;
    exists = false;
    create = create;

    constructor(...parts: (string | { uri: string })[]) {
      this.uri = parts.map((part) => (typeof part === 'string' ? part : part.uri)).join('/');
    }
  }

  class MockFile {
    uri: string;
    exists = true;
    copy = copy;
    delete = remove;

    constructor(...parts: (string | { uri: string })[]) {
      this.uri = parts.map((part) => (typeof part === 'string' ? part : part.uri)).join('/');
    }
  }

  return {
    Paths: { document: { uri: 'file:///documents' } },
    Directory: MockDirectory,
    File: MockFile,
    __mockFns: { create, copy, remove },
  };
});

import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { createExpoPhotoService } from '../photos';

const launchCameraMock = ImagePicker.launchCameraAsync as jest.Mock;
const launchLibraryMock = ImagePicker.launchImageLibraryAsync as jest.Mock;
const cameraPermissionMock = ImagePicker.requestCameraPermissionsAsync as jest.Mock;
const libraryPermissionMock = ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock;
const pendingResultMock = ImagePicker.getPendingResultAsync as jest.Mock;
const {
  create: createDirectoryMock,
  copy: copyMock,
  remove: removeFileMock,
} = (
  FileSystem as unknown as { __mockFns: { create: jest.Mock; copy: jest.Mock; remove: jest.Mock } }
).__mockFns;

beforeEach(() => {
  jest.clearAllMocks();
  cameraPermissionMock.mockResolvedValue({ granted: true });
  libraryPermissionMock.mockResolvedValue({ granted: true });
});

describe('photo service', () => {
  it('picks from camera and returns the asset uri', async () => {
    launchCameraMock.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///cache/pick.jpg' }],
    });
    const service = createExpoPhotoService();

    await expect(service.pickFromCamera()).resolves.toBe('file:///cache/pick.jpg');
    expect(cameraPermissionMock).toHaveBeenCalled();
    expect(launchCameraMock).toHaveBeenCalledWith(
      expect.objectContaining({ allowsEditing: true, quality: 0.7 }),
    );
  });

  it('returns null when the camera is cancelled', async () => {
    launchCameraMock.mockResolvedValue({ canceled: true, assets: null });
    const service = createExpoPhotoService();

    await expect(service.pickFromCamera()).resolves.toBeNull();
  });

  it('picks from the library', async () => {
    launchLibraryMock.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///cache/library.jpg' }],
    });
    const service = createExpoPhotoService();

    await expect(service.pickFromLibrary()).resolves.toBe('file:///cache/library.jpg');
    expect(libraryPermissionMock).toHaveBeenCalled();
  });

  it('restores a pending picker result', async () => {
    pendingResultMock.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///cache/pending.jpg' }],
    });
    const service = createExpoPhotoService();

    await expect(service.restorePendingPickerResult()).resolves.toBe('file:///cache/pending.jpg');
  });

  it('returns null when there is no pending result', async () => {
    pendingResultMock.mockResolvedValue(null);
    const service = createExpoPhotoService();

    await expect(service.restorePendingPickerResult()).resolves.toBeNull();
  });

  it('copies a photo into the document directory', async () => {
    const service = createExpoPhotoService();

    await expect(service.save('file:///cache/pick.jpg', 'item-1')).resolves.toBe(
      'photos/item-1.jpg',
    );
    expect(createDirectoryMock).toHaveBeenCalled();
    expect(copyMock).toHaveBeenCalled();
  });

  it('resolves a relative path to a document uri', () => {
    const service = createExpoPhotoService();

    expect(service.resolve('photos/item-1.jpg')).toBe('file:///documents/photos/item-1.jpg');
    expect(service.resolve(null)).toBeNull();
  });

  it('removes a photo file', async () => {
    const service = createExpoPhotoService();

    await service.remove('photos/item-1.jpg');
    expect(removeFileMock).toHaveBeenCalled();

    removeFileMock.mockClear();
    await service.remove(null);
    expect(removeFileMock).not.toHaveBeenCalled();
  });
});
