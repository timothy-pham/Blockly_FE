import app from "../firebase"
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import moment from "moment";
const storage = getStorage(app);
export const uploadImage = async (image, folder) => {
    try {
        const time = moment().unix();
        const imageName = `${time}-${image.name}`;
        const storageRef = ref(storage, `${folder}/${imageName}`);
        await uploadBytesResumable(storageRef, image);
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
    } catch (error) {
        console.error("Error uploading image: ", error);
        return "";
    }
}   