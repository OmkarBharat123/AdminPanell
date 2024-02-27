import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Dashboard from './Dashboard';

export default function App() {
  return (
    <View style={styles.container}>
   <Dashboard/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:1
  },
});
