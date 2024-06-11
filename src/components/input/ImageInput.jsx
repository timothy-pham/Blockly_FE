import { Button } from "@mui/material";
import { VisuallyHiddenInput } from "../styleInput";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useEffect } from "react";

export const ImageInput = (props) => {
  const { setPreview, setSelectedImage, preview, defaultValue } = props;
  console.log("defaultValue===", defaultValue);
  useEffect(() => {
    if (defaultValue) {
      setPreview(defaultValue);
    }
  }, []);
  return (
    <div className="flex flex-col items-center mt-2">
      <Button
        component="label"
        variant="contained"
        onChange={(event) => {
          const file = event.target.files[0];
          const object = URL.createObjectURL(file);
          setPreview(object);
          setSelectedImage(file); // Update the state with the selected file
        }}
        startIcon={<CloudUploadIcon />}
      >
        Thêm hình ảnh
        <VisuallyHiddenInput type="file" name="image" />
      </Button>

      {preview && (
        <img
          width={500}
          height={500}
          src={preview}
          alt=""
          className="w-full h-full object-contain mt-2 max-h-[290px]"
        />
      )}
    </div>
  );
};
