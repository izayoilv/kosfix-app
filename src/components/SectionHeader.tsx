import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>{title}</Text>
      {actionLabel === undefined || onAction === undefined ? null : (
        <Button compact onPress={onAction} textColor={theme.colors.primary}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
});
