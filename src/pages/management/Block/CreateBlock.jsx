import { BlocklyLayout } from "../../../components/Blockly";
import {
  Button,
  Box,
  TextField,
  Autocomplete,
  Typography,
  Paper,
} from "@mui/material";
import React, { useState } from "react";
import { createData } from "../../../utils/dataProvider";
import { transformCodeBlockly } from "../../../utils/transform";
import { uploadImage } from "../../../utils/firebase";
import { ImageInput } from "../../../components/input/ImageInput";
import { toast } from "react-toastify";
import { toastOptions } from "../../../constant/toast";
import { useNavigate } from "react-router-dom";

export const CreateBlock = () => {
  const [dataBlock, setDataBlocks] = useState(null);
  const [answers, setAnswers] = useState("");
  const [showAnswers, setShowAnswers] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  const handlePreviewClick = (e) => {
    e.preventDefault();
    setShowAnswers(true);
    setAnswers(dataBlock?.code || ""); // Set answers based on Blockly data
  };

  const handleAnswersChange = (e) => {
    setAnswers(e.target.value); // Update answers when edited
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const dataForm = new FormData(event.currentTarget);

    // Upload image
    const imageUrl = await uploadImage(selectedImage, "blocks");

    try {
      const res = await createData("blocks", {
        name: dataForm.get("name"),
        question: dataForm.get("question"),
        level: dataForm.get("level"),
        type: dataForm.get("type"),
        data: dataBlock?.data,
        answers: transformCodeBlockly(answers),
        meta_data: {
          description: dataForm.get("description"),
          image: imageUrl,
        },
      });
      if (res) {
        toast.success("Thêm mới câu hỏi thành công.", toastOptions);
        navigate("/blockManagement");
      }
    } catch (err) {
      toast.error(
        "Có lỗi trong lúc thêm mới câu hỏi. Vui lòng kiểm tra lại.",
        toastOptions
      );
    } finally {
      event.target.value = "";
      setAnswers("");
      setShowAnswers(false);
    }
  };

  return (
    <Paper sx={{ padding: 3 }}>
      <Typography variant="h4">Tạo câu hỏi</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <div>
            <TextField
              margin="normal"
              required
              fullWidth
              id="Name"
              label="Tên"
              name="name"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="Question"
              label="Câu hỏi"
              name="question"
            />

            <Autocomplete
              disablePortal
              id="type"
              fullWidth
              options={[{ id: "all" }, { id: "include" }]}
              getOptionLabel={(option) => option.id}
              renderInput={(params) => (
                <TextField {...params} label="Loại câu hỏi" name="type" />
              )}
              renderOption={(props, option) => (
                <div {...props}>
                  <h3>{option?.id}</h3>
                </div>
              )}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              id="Level"
              type="number"
              label="Cấp độ"
              name="level"
            />
            <ImageInput
              setPreview={setPreview}
              setSelectedImage={setSelectedImage}
              preview={preview}
            />
          </div>

          <div>
            <div>
              <BlocklyLayout setDataBlocks={setDataBlocks} />
            </div>
            <>
              <Button
                disabled={!dataBlock?.code}
                onClick={handlePreviewClick}
                variant="outlined"
                sx={{ mt: 3, mb: 2 }}
              >
                Kiểm tra câu trả lời
              </Button>
              {showAnswers && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  value={answers}
                  multiline
                  maxRows={2}
                  onChange={handleAnswersChange}
                  id="Answers"
                  label="Đáp án"
                  name="answers"
                  helperText="Có thể nhiều hơn 1 đáp án. Đáp án chỉ lấy các giá trị có toán tử như: =, >, <, >=, <=, !="
                />
              )}
            </>
          </div>
        </div>
        <Button type="submit" variant="contained" sx={{ mt: 3, mb: 2 }}>
          Lưu
        </Button>
      </Box>
    </Paper>
  );
};
