import { StyleSheet, View, Button } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getDatabase, ref, remove } from 'firebase/database';

const DeleteData = () => {
  const firebaseConfig = {
    apiKey: "AIzaSyDM7TphLfyp5ClfiEdEC_JOQ6jTBvIszgs",
    authDomain: "adminpanal-84e6c.firebaseapp.com",
    databaseURL: "https://adminpanal-84e6c-default-rtdb.firebaseio.com",
    projectId: "adminpanal-84e6c",
    storageBucket: "adminpanal-84e6c.appspot.com",
    messagingSenderId: "1052688828458",
    appId: "1:1052688828458:web:2288c733b1283ebe2fdb53",
    measurementId: "G-8T7Q7048L3"
  };

  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const database = getDatabase(app);

  const deleteData = () => {
    const dataRef = ref(database, 'UserData/'); // Update the path accordingly
    remove(dataRef)
      .then(() => {
        console.log("Remove Succeeded..!!");
      })
      .catch((error) => {
        console.log("Remove Failed: " + error.message);
      });
  };

  return (
    <View>
      <Button title='Delete' onPress={deleteData} />
    </View>
  );
};

export default DeleteData;

const styles = StyleSheet.create({});
