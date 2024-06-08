import app from "../firebase"
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const storage = getStorage(app);
export const uploadImage = async (image, folder) => {
    try {
        const storageRef = ref(storage, `${folder}/${image.name}`);
        await uploadBytesResumable(storageRef, image);
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
    } catch (error) {
        console.error("Error uploading image: ", error);
        return "";
    }
}   