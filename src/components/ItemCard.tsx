import { Image, Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card, Text, useTheme } from 'react-native-paper';
import { CATEGORY_LABELS, LOCATION_LABELS } from '../domain/labels';
import { formatDate } from '../domain/formatting';
import { isOverdue } from '../domain/overdue';
import type { Item } from '../domain/types';
import { radius, spacing } from '../theme/tokens';
import { OverdueLabel } from './OverdueLabel';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { MoneyText } from './MoneyText';

const CATEGORY_ICONS: Record<Item['category'], string> = {
  elektronik: 'flash-outline',
  furnitur: 'chair-outline',
  kamar_mandi: 'shower-head',
  bangunan: 'hammer-wrench',
  lainnya: 'package-variant-closed',
};

type ItemCardProps = {
  item: Item;
  today: string;
  onPress: () => void;
  resolvePhoto: (path: string | null) => string | null;
  variant?: 'list' | 'urgent';
};

export function ItemCard({ item, today, onPress, resolvePhoto, variant = 'list' }: ItemCardProps) {
  const theme = useTheme();
  const photoUri = resolvePhoto(item.photoPath);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.name}
      onPress={onPress}
      style={styles.pressable}
    >
      <Card mode={variant === 'urgent' ? 'contained' : 'elevated'} style={styles.card}>
        <Card.Content style={styles.content}>
          <View style={[styles.thumbnail, { backgroundColor: theme.colors.surfaceVariant }]}>
            {photoUri === null ? (
              <MaterialCommunityIcons
                name={CATEGORY_ICONS[item.category] as never}
                size={28}
                color={theme.colors.onSurfaceVariant}
              />
            ) : (
              <Image source={{ uri: photoUri }} style={styles.photo} />
            )}
          </View>

          <View style={styles.body}>
            <Text style={[styles.name, { color: theme.colors.onSurface }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[styles.meta, { color: theme.colors.onSurfaceVariant }]}>
              {CATEGORY_LABELS[item.category]} · {LOCATION_LABELS[item.location]}
            </Text>
            <View style={styles.badges}>
              <PriorityBadge priority={item.priority} />
              <StatusBadge status={item.status} />
              <OverdueLabel visible={isOverdue(item, today)} />
            </View>
            <View style={styles.footer}>
              <MoneyText value={item.estimatedCost} />
              <Text style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>
                {formatDate(item.targetDate)}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: radius.card,
  },
  card: {
    borderRadius: radius.card,
  },
  content: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  thumbnail: {
    alignItems: 'center',
    borderRadius: radius.card,
    height: 72,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 72,
  },
  photo: {
    height: '100%',
    width: '100%',
  },
  body: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
  },
  meta: {
    fontSize: 12,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  date: {
    fontSize: 11,
  },
});
