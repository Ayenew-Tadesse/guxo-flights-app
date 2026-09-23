import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';

/** Logo mark + wordmark, as on the web prototype's auth screens. */
export function Brand() {
  return (
    <View style={styles.brand} accessibilityLabel="Guxo Flights">
      <View style={styles.mark}>
        <MaterialIcons name="flight-takeoff" size={16} color={Colors.onPrimary} />
      </View>
      <Text style={styles.word}>Guxo Flights</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  brand: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  mark: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  word: { fontSize: 17, fontWeight: '800', color: Colors.ink },
});
