import { BlocklyLayout } from "../../../components/Blockly";
import { Button, TextField, Autocomplete, Box } from "@mui/material";
import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  fetchData,
  createData,
  fetchDataDetail,
  updateData,
} from "../../../utils/dataProvider";
import { useLocation } from "react-router-dom";
import { transformCodeBlockly } from "../../../utils/transform";

export const EditBlock = () => {
  const location = useLocation();
  const id = location?.pathname?.split("/")[2];
  const [category, setCategory] = useState([]);
  const [categoryValue, setCategoryValue] = useState();
  const [dataBlock, setDataBlocks] = useState();
  const [blockDetail, setBlockDetail] = useState();

  const [answers, setAnswers] = useState("");
  const [showAnswers, setShowAnswers] = useState(false);
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
    console.log(e.target.value);
    setAnswers(e.target.value); // Update answers when edited
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const dataForm = new FormData(event.currentTarget);
    try {
      await updateData("blocks", id, {
        name: dataForm.get("name"),
        question: dataForm.get("question"),
        level: dataForm.get("level"),
        type: dataForm.get("type"),
        group_id: categoryValue,
        data: dataBlock.data,
        answers: transformCodeBlockly(answers),
        meta_data: {
          description: dataForm.get("description"),
        },
      });
    } catch (err) {
      console.log("can not create block");
    }
  };

  return (
    <>
      Edit Block
      {blockDetail && (
        <Box
          className="flex flex-col items-center"
          component="form"
          onSubmit={handleSubmit}
          sx={{ mt: 1, width: "100%" }}
        >
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
              Preview
            </Button>
            {showAnswers && (
              <TextField
                margin="normal"
                required
                fullWidth
                defaultValue={transformCodeBlockly(answers)[0]}
                onChange={handleAnswersChange}
                id="Answers"
                label="Đáp án"
                name="answers"
                multiline
              />
            )}
          </>
          <Button type="submit" variant="contained" sx={{ mt: 3, mb: 2 }}>
            Submit
          </Button>
        </Box>
      )}
    </>
  );
};
