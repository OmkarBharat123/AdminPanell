import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Linking } from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from 'firebase/firestore';

// Firebase configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);

const Dashboard = () => {
  const [showGalleryImages, setShowGalleryImages] = useState(false);

  const [allStock, setAllStock] = useState([]);
  const [user, setUser] = useState({
    sku_cod: '',
    year: '',
    model_name: '',
    company_name: '',
    woner: '',
    running: '',
    fual: '',
    insurence: '',
    week: '',
    finel_offer: '',
    down_payment: '',
    loan: '',
    variant: '',
    carImage: '',
    galleryImages: [],
    link: '', // Add this new field for the link
  });
  

  const [showCarImage, setShowCarImage] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isGalleryVisible, setIsGalleryVisible] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const stockCollection = collection(db, 'UserData');
      const stockSnapshot = await getDocs(stockCollection);
      const stockData = stockSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      stockData.forEach((item) => {
        if (!Array.isArray(item.galleryImages)) {
          item.galleryImages = [];
        }
      });

      setAllStock(stockData);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  const handleInputChange = (fieldName, text) => {
    setUser((prevUser) => ({ ...prevUser, [fieldName]: text }));
  };

  const selectImage = async () => {
    try {
      let results = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        multiple: true,
      });

      if (!results.cancelled) {
        const imageUris = results.assets.map((image) => image.uri);
        setUser((prevUser) => ({
          ...prevUser,
          galleryImages: [...prevUser.galleryImages, ...imageUris],
        }));
        setIsGalleryVisible(true);
      }
    } catch (error) {
      console.error('Error picking gallery images:', error.message);
    }
  };

  const uploadImage = async (imageUri, isCarImage = false) => {
    try {
      const response = await fetch(imageUri);
      const blobImage = await response.blob();

      const metadata = {
        contentType: 'image/jpeg',
      };

      const folder = isCarImage ? 'carImages/' : 'galleryImages/';
      const storageRef = ref(storage, `${folder}${user.sku_cod}_${Date.now()}`);
      const uploadTask = uploadBytesResumable(
        storageRef,
        blobImage,
        metadata
      );

      await uploadTask;

      const downloadURL = await getDownloadURL(storageRef);
      console.log('File available at', downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error.message);
    }
  };

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      console.log(result);

      if (!result.cancelled) {
        const { uri: imageUri } = result.assets[0];
        setUser((prevUser) => ({ ...prevUser, carImage: imageUri }));

        await handleImageSelection(imageUri);
      }
    } catch (error) {
      console.error('Error picking image:', error.message);
    }
  };

  const handleImageSelection = async (imageUri) => {
    try {
      await uploadImage(imageUri, true);
      setShowCarImage(true);
    } catch (error) {
      console.error('Error handling image selection:', error.message);
    }
  };

  const onGalleryItemPress = (index) => {
    setIsGalleryVisible(true);
  };

  const uploadGalleryImages = async () => {
    try {
      const uploadedImages = [];

      for (const galleryImage of user.galleryImages) {
        const downloadURL = await uploadImage(galleryImage, false);
        uploadedImages.push(downloadURL);
      }

      setUser((prevUser) => ({ ...prevUser, galleryImages: uploadedImages }));
      alert('Gallery Images Uploaded Successfully');
    } catch (error) {
      console.error('Error uploading gallery images:', error.message);
    }
  };

  const handleSubmit = async () => {
    try {
      const requiredFields = ['sku_cod', 'year', 'model_name'];
      const missingFields = requiredFields.filter(
        (field) => !user[field]
      );
  
      if (missingFields.length > 0) {
        alert(
          `Please fill in all required fields: ${missingFields.join(', ')}`
        );
        return;
      }
  
      const stockCollection = collection(db, 'UserData');
      await addDoc(stockCollection, user);
  
      if (user.carImage) {
        const carImageURL = await uploadImage(user.carImage, true);
        setUser((prevUser) => ({ ...prevUser, carImage: carImageURL }));
        setShowCarImage(false);
      }
  
      if (user.galleryImages.length > 0) {
        await uploadGalleryImages();
      }
  
      alert('Stock Added Successfully');
      fetchData();
      clearInputFields();
    } catch (error) {
      console.error('Error:', error.message);
      alert('Error Occurred');
    }
  };
  
  const clearInputFields = () => {
    const emptyUser = Object.fromEntries(
      Object.keys(user).map((key) => [key, ''])
    );
    setUser(emptyUser);
  };

  const onDeleteItem = async (item) => {
    try {
      await deleteDoc(doc(db, 'UserData', item.id));
      console.log('User Deleted!');
      fetchData();
    } catch (error) {
      console.error('Error deleting user:', error.message);
    }
  };

  const onItemSelected = (item) => {
    setSelectedItem(item);
    setShowGalleryImages(true);
  };

  const renderGalleryImages = () => {
    if (!selectedItem || !selectedItem.galleryImages) {
      return null;
    }

    const galleryImagesArray = Array.isArray(selectedItem.galleryImages)
      ? selectedItem.galleryImages
      : [selectedItem.galleryImages];

    return (
      <ScrollView horizontal style={styles.galleryContainer}>
        {galleryImagesArray.map((image, index) => (
          <TouchableOpacity
            key={`galleryImage_${index}`}
            onPress={() => onGalleryItemPress(index)}
          >
            {image && (
              <Image
                source={{ uri: image }}
                style={styles.selectedImage}
              />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const ItemProfileScreen = () => {
    if (!selectedItem) {
      return null;
    }
  
    const handleLinkPress = () => {
      if (selectedItem.link) {
        Linking.openURL(selectedItem.link);
      }
    };
  
    return (
      <View style={styles.itemProfileContainer}>
        <Image
          source={{ uri: selectedItem.carImage }}
          style={styles.itemProfileImage}
        />
        <Text style={styles.itemProfileTitle}>{` ${selectedItem.model_name}  `}</Text>
        {showGalleryImages && renderGalleryImages()}
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
            <View style={{ padding: 20 }}>
            <Text style={{ padding: 10 }}>{`कि.मी रनींग : ${selectedItem.running}`}</Text>
            <Text style={{ padding: 10 }}>{`इंधन: ${selectedItem.fual}`}</Text>
            <Text style={{ padding: 10 }}> {`वर्ष: ${selectedItem.year}`}</Text>
            <Text style={{ padding: 10 }}>{`प्रकार: ${selectedItem.variant}`}</Text>
            <Text style={{ padding: 10 }}>{`कंपनीचे नाव: ${selectedItem.company_name}`}</Text>
            <Text style={{ padding: 10 }}>{`ओनर : ${selectedItem.woner}`}</Text>
          </View>
          <View style={{ padding: 20 }}>
            <Text style={{ padding: 10 }}>{`इन्शुरन्स : ${selectedItem.insurence}`}</Text>
            <Text style={{ padding: 10 }}>{`लोन किती होऊ शकते  : ${selectedItem.loan}`}</Text>
            <Text style={{ padding: 10 }}> {`हफ्ता  : ${selectedItem.week}`}</Text>
            <Text style={{ padding: 10 }}>{`फायनल ऑफर  : ${selectedItem.finel_offer}`}</Text>
            <Text style={{ padding: 10 }}>{`अंदाजे डाउन पेमेंट   : ${selectedItem.down_payment}`}</Text>
            {selectedItem.link && (
              <Text style={{ padding: 10 }}>{`Link: ${selectedItem.link}`}</Text>
            )}
          
            {selectedItem.link && (
              <TouchableOpacity onPress={handleLinkPress}>
                <Text style={{ padding: 10, color: 'blue', textDecorationLine: 'underline' }}>Youtube Viedo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };
  
  

  const renderItem = ({ item }) => (
    <View style={styles.stockItem}>
      <View style={styles.stockListContainer}>
        <Text style={styles.stockTitleText}>{` ${item.model_name} `}</Text>
        <Text style={styles.stockText}>{` ${item.running},  ${item.fual}  `}</Text>
        <Text style={styles.stockPriceText}>{` ${item.finel_offer}`}</Text>
        <Text style={styles.stockEmiText}>{` EMIs From:${item.loan}`}</Text>
      </View>
      {item.carImage && (
        <Image source={{ uri: item.carImage }} style={styles.stockImage} />
      )}
      <Button
        title="View Profile"
        onPress={() => onItemSelected(item)}
      />
      <Button
        title="Delete Item"
        onPress={() => onDeleteItem(item)}
      />
    </View>
  );

  const renderInputFields = () => {
    const fields = [
      'sku_cod',
      'year',
      'model_name',
      'variant',
      'company_name',
      'woner',
      'running',
      'fual',
      'insurence',
      'loan',
      'week',
      'finel_offer',
      'down_payment',
      'link', // Add the new field for the link
    ];
  
    return fields.map((field) => (
      <View key={field} style={styles.inputeContainer1}>
        <Text style={styles.textTitle}>{field.replace(/_/g, ' ')}</Text>
        <TextInput
          style={styles.inpute}
          value={user[field]}
          onChangeText={(text) => handleInputChange(field, text)}
        />
      </View>
    ));
  };
  

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
      <View style={styles.container}>
        <Button
          style={{ paddingBottom: 10 }}
          title="Upload Car Image"
          onPress={() => pickImage()}
        />
        {showCarImage && user.carImage && (
          <Image source={{ uri: user.carImage }} style={styles.selectedImage} />
        )}

        <View style={{ marginTop: 50, width: 150 }}>
          <Button
            title="Upload All Gallery Images"
            onPress={selectImage}
          />
          {isGalleryVisible && (
            <ScrollView horizontal style={styles.galleryContainer}>
              {Array.isArray(user.galleryImages) &&
                user.galleryImages.map((image, index) => (
                  <Image
                    key={`selectedImage_${index}`}
                    source={{ uri: image }}
                    style={styles.selectedImage}
                  />
                ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.inpContainer}>{renderInputFields()}</View>
        <Button title="Add Stock" onPress={handleSubmit} />

        {allStock.length === 0 ? (
          <Text>Loading...</Text>
        ) : (
          <FlatList
            data={allStock}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
          />
        )}

        <ItemProfileScreen />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  inpContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  inpute: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 8,
    width: 150,
    borderRadius: 10,
    alignSelf: 'stretch',
  },
  galleryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  textTitle: {
    fontSize: 20,
    marginBottom: 5,
  },
  inputeContainer1: {
    padding: 10,
  },
  stockItem: {
    padding: 10,
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 5,
    marginTop: 10,
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 200,
  },
  stockListContainer: {
    borderLeftWidth: 0.2,
    borderLeftColor: 'black',
  },
  stockText: {
    fontSize: 13,
  },

  stockEmiText: {
    fontSize: 16,
    paddingTop: 15,
  },
  stockPriceText: {
    paddingTop: 15,
    fontSize: 16,
    fontWeight: 'bold',
  },
  stockTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  stockImage: {
    width: 150,
    height: 100,
    marginTop: 10,
    borderRadius: 5,
  },
  selectedImage: {
    width: 80,
    height: 60,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 5,
  },
  itemProfileContainer: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  itemProfileTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  itemProfileImage: {
    width: 150,
    height: 100,
    marginTop: 10,
    borderRadius: 5,
  },
});

export default Dashboard;
