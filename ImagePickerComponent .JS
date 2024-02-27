import React, { useEffect, useState } from 'react';

const ImagePickerComponent = ({ setImage, setUploadedImage }) => {
    const [image, setImage] = useState(null);

    const pickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled) {
                setImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error.message);
        }
    };

    const uploadImage = async () => {
        // Your upload logic here
        // ...

        // Assuming setUploadedImage is a function to update the state
        setUploadedImage(image);
    };

    useEffect(() => {
        if (image !== null) {
            uploadImage();
        }
    }, [image]);

    return (
        <Button title="Upload Image" onPress={pickImage} />
    );
};

export default ImagePickerComponent;
