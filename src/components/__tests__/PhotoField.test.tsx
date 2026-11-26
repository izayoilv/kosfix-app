import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../test/renderWithProviders';
import { PhotoField } from '../PhotoField';

describe('PhotoField', () => {
  it('shows placeholder and picker actions when empty', async () => {
    const onPickCamera = jest.fn();
    const onPickLibrary = jest.fn();
    await renderWithProviders(
      <PhotoField
        photoPath={null}
        resolvePhoto={() => null}
        onPickCamera={onPickCamera}
        onPickLibrary={onPickLibrary}
        onRemove={jest.fn()}
      />,
    );

    expect(screen.getByText('Belum ada foto')).toBeOnTheScreen();
    await fireEvent.press(screen.getByText('Kamera'));
    await fireEvent.press(screen.getByText('Galeri'));
    expect(onPickCamera).toHaveBeenCalledTimes(1);
    expect(onPickLibrary).toHaveBeenCalledTimes(1);
  });

  it('shows a photo and remove action when present', async () => {
    const onRemove = jest.fn();
    await renderWithProviders(
      <PhotoField
        photoPath="photos/item-1.jpg"
        resolvePhoto={() => 'file:///documents/photos/item-1.jpg'}
        onPickCamera={jest.fn()}
        onPickLibrary={jest.fn()}
        onRemove={onRemove}
      />,
    );

    expect(screen.getByLabelText('Foto barang')).toBeOnTheScreen();
    await fireEvent.press(screen.getByText('Hapus foto'));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});
