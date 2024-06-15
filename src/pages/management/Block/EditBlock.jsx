import { BlocklyLayout } from "../../../components/Blockly";
import { Button, TextField, Autocomplete, Box, Paper } from "@mui/material";
import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  fetchData,
  apiPost,
  fetchDataDetail,
  updateData,
} from "../../../utils/dataProvider";
import { useLocation, useNavigate } from "react-router-dom";
import { transformCodeBlockly } from "../../../utils/transform";
import { toast } from "react-toastify";
import { toastOptions } from "../../../constant/toast";
import { ImageInput } from "../../../components/input/ImageInput";
import { uploadImage } from "../../../utils/firebase";

export const EditBlock = () => {
  const location = useLocation();
  const id = location?.pathname?.split("/")[2];
  const [category, setCategory] = useState([]);
  const [categoryValue, setCategoryValue] = useState();
  const [dataBlock, setDataBlocks] = useState();
  const [blockDetail, setBlockDetail] = useState();
  const [answers, setAnswers] = useState("");
  const [showAnswers, setShowAnswers] = useState(false);
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const fetchCategory = async () => {
    try {
      const res = await fetchData("groups");
      if (res) {
        setCategory(res);
      }
    } catch (e) {
      console.log("can not fetch groups");
    }
  };

  const fetchBlockData = async () => {
    try {
      const res = await fetchDataDetail("blocks", id);
      if (res) {
        setBlockDetail(res);
        setAnswers(res.answers.toString());
      }
    } catch (e) {
      console.log("can not fetch groups");
    }
  };

  useEffect(() => {
    fetchCategory();
  }, []);

  useEffect(() => {
    if (id) {
      fetchBlockData();
    }
  }, [id]);

  const handlePreviewClick = (e) => {
    e.preventDefault();
    setShowAnswers(true);
    setAnswers(dataBlock?.code); // Set answers based on Blockly data
  };

  const handleAnswersChange = (e) => {
    setAnswers(e.target.value); // Update answers when edited
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const dataForm = new FormData(event.currentTarget);
    let imageUrl;
    if (selectedImage) {
      imageUrl = await uploadImage(selectedImage, "blocks");
    }

    try {
      const res = await updateData("blocks", id, {
        name: dataForm.get("name"),
        question: dataForm.get("question"),
        level: dataForm.get("level"),
        type: dataForm.get("type"),
        group_id: categoryValue,
        data: dataBlock.data,
        answers: transformCodeBlockly(answers),
        meta_data: {
          description: dataForm.get("description"),
          image: !preview.includes("blob") ? preview : imageUrl,
        },
      });
      console.log("res=====>", res);
      if (res) {
        toast.success("Chỉnh sửa câu hỏi thành công.", toastOptions);
        navigate("/blockManagement");
      }
    } catch (err) {
      console.log("err ===>", err);
      toast.error(
        "Có lỗi trong lúc chỉnh sửa câu hỏi. Vui lòng kiểm tra lại.",
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
      Chỉnh sửa câu hỏi
      {blockDetail && (
        <Box
          className="flex flex-col items-center"
          component="form"
          onSubmit={handleSubmit}
          sx={{ mt: 1, width: "100%" }}
        >
          <div style={{ display: "flex", gap: 10 }}>
            <div>
              <TextField
                margin="normal"
                required
                fullWidth
                id="Name"
                defaultValue={blockDetail?.name}
                label="Tên"
                name="name"
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                defaultValue={blockDetail?.question}
                id="Question"
                label="Câu hỏi"
                name="question"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                defaultValue={blockDetail?.level}
                id="Level"
                type="number"
                label="Cấp độ"
                name="level"
              />
              <Autocomplete
                id="type"
                fullWidth
                defaultValue={[{ id: "all" }, { id: "include" }].find(
                  (option) => option.id == blockDetail?.type
                )}
                options={[{ id: "all" }, { id: "include" }]}
                getOptionLabel={(option) => option.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Loại câu hỏi"
                    name="type"
                    id="type"
                  />
                )}
                renderOption={(props, option) => (
                  <div {...props}>
                    <h3>{option?.id}</h3>
                  </div>
                )}
              />
              <Autocomplete
                sx={{ marginTop: 1 }}
                id="collections"
                fullWidth
                options={category}
                defaultValue={category.find(
                  (option) => option.group_id == blockDetail.group.group_id
                )}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => (
                  <TextField {...params} label="Danh Mục" id="group_id" />
                )}
                onChange={(e, val) => setCategoryValue(val?.group_id)}
                renderOption={(props, option) => (
                  <div {...props}>
                    <h3>{option?.name}</h3>
                  </div>
                )}
              />
              <ImageInput
                setPreview={setPreview}
                setSelectedImage={setSelectedImage}
                preview={preview}
                defaultValue={blockDetail?.meta_data?.image}
              />
            </div>
            <div>
              <div>
                <BlocklyLayout
                  setDataBlocks={setDataBlocks}
                  data={blockDetail.data}
                />
              </div>
              <>
                <Button
                  onClick={handlePreviewClick}
                  variant="outlined"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Kiểm tra câu trả lời
                </Button>
                {(blockDetail.answers || showAnswers) && (
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
            Luư
          </Button>
        </Box>
      )}
    </Paper>
  );
};
