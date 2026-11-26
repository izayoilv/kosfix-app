import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Portal, Snackbar } from 'react-native-paper';

type FeedbackContextValue = {
  showMessage: (message: string) => void;
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('');
  const showMessage = useCallback((next: string) => setMessage(next), []);
  const value = useMemo(() => ({ showMessage }), [showMessage]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <Portal>
        <SafeAreaView edges={['bottom']} style={styles.overlay} pointerEvents="box-none">
          <Snackbar visible={message.length > 0} onDismiss={() => setMessage('')} duration={4000}>
            {message}
          </Snackbar>
        </SafeAreaView>
      </Portal>
    </FeedbackContext.Provider>
  );
}

export function useFeedback(): FeedbackContextValue {
  const value = useContext(FeedbackContext);

  if (value === null) {
    throw new Error('useFeedback must be used inside FeedbackProvider');
  }

  return value;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
});
