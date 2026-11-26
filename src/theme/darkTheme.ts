import { MD3DarkTheme } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';
import { darkPaperColors } from './tokens';

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...darkPaperColors,
  } as MD3Theme['colors'],
};
