import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import { HomeScreen } from '../screens/HomeScreen';
import { ItemDetailScreen } from '../screens/ItemDetailScreen';
import { ItemFormScreen } from '../screens/ItemFormScreen';
import { ItemsScreen } from '../screens/ItemsScreen';
import { StatsScreen } from '../screens/StatsScreen';

export type RootStackParamList = {
  Tabs: undefined;
  ItemDetail: { itemId: string; message?: string };
  ItemForm: { itemId?: string };
};

export type TabParamList = {
  Beranda: undefined;
  Barang: undefined;
  Statistik: undefined;
};

export type RootNavigatorProps = {
  initialRouteName?: 'Tabs' | 'ItemDetail' | 'ItemForm';
  initialParams?: { itemId?: string };
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const TAB_ICONS: Record<keyof TabParamList, keyof typeof MaterialCommunityIcons.glyphMap> = {
  Beranda: 'home-variant',
  Barang: 'format-list-bulleted',
  Statistik: 'chart-bar',
};

function TabsNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name={TAB_ICONS[route.name]} color={color} size={size} />
        ),
      })}
    >
      <Tab.Screen name="Beranda" component={HomeScreen} />
      <Tab.Screen name="Barang" component={ItemsScreen} />
      <Tab.Screen name="Statistik" component={StatsScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator({ initialRouteName = 'Tabs', initialParams }: RootNavigatorProps) {
  return (
    <Stack.Navigator initialRouteName={initialRouteName}>
      <Stack.Screen name="Tabs" component={TabsNavigator} options={{ headerShown: false }} />
      <Stack.Screen
        name="ItemDetail"
        component={ItemDetailScreen}
        initialParams={initialParams as { itemId: string } | undefined}
        options={{ title: 'Detail' }}
      />
      <Stack.Screen
        name="ItemForm"
        component={ItemFormScreen}
        initialParams={initialParams ?? {}}
        options={{ title: 'Barang' }}
      />
    </Stack.Navigator>
  );
}
