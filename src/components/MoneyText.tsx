import { Text, useTheme } from 'react-native-paper';
import { formatRupiah } from '../domain/formatting';

export function MoneyText({ value }: { value: number | null }) {
  const theme = useTheme();

  return (
    <Text style={{ color: theme.colors.onSurface, fontWeight: '600' }}>{formatRupiah(value)}</Text>
  );
}
