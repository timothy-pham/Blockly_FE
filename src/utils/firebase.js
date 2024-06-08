import app from "../firebase"
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const storage = getStorage(app);
export const uploadImage = async (image, folder) => {
    try {
        const storageRef = ref(storage, `${folder}/${image.name}`);
        const snapshot = await uploadBytesResumable(storageRef, image);
        console.log("Uploaded a blob or file!", snapshot);
        const downloadURL = await getDownloadURL(storageRef);
        console.log("File available at", downloadURL);
        return downloadURL;
    } catch (error) {
        console.error("Error uploading image: ", error);
        return "";
    }
}   