import { BlocklyLayout } from "../../../components/Blockly";
import { Button, TextField, Autocomplete, Box } from "@mui/material";
import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  fetchData,
  createData,
  fetchDataDetail,
} from "../../../utils/dataProvider";
import { useLocation } from "react-router-dom";

export const EditBlock = () => {
  const location = useLocation();
  const id = location?.pathname?.split("/")[2];
  const [category, setCategory] = useState([]);
  const [categoryValue, setCategoryValue] = useState("");
  const [dataBlock, setDataBlocks] = useState({
    name: "",
    question: "",
    level: "",
    group_id: "",
    data: {},
    answers: "",
  });

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
        setDataBlocks(res);
      }
    } catch (e) {
      console.log("can not fetch groups");
    }
  };

  useLayoutEffect(() => {
    fetchCategory();
    fetchBlockData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const dataForm = new FormData(event.currentTarget);
    try {
      await createData("blocks", {
        name: dataForm.get("name"),
        question: dataForm.get("question"),
        level: dataForm.get("level"),
        group_id: categoryValue,
        data: dataBlock.data,
        answers: dataBlock.code,
        meta_data: {
          description: dataForm.get("description"),
        },
      });
    } catch (err) {
      console.log("can not create block");
    }
    console.log("submit");
  };

  return (
    <>
      Edit Block
      <Box
        className="flex flex-col items-center"
        component="form"
        defaultValue={dataBlock}
        onSubmit={handleSubmit}
        sx={{ mt: 1, width: "100%" }}
      >
        <TextField
          margin="normal"
          required
          fullWidth
          id="Name"
          defaultValue={dataBlock.name}
          label="Tên"
          name="name"
          autoFocus
        />
        <TextField
          margin="normal"
          required
          fullWidth
          defaultValue={dataBlock.question}
          id="Question"
          label="Câu hỏi"
          name="question"
        />
        <TextField
          margin="normal"
          required
          fullWidth
          defaultValue={dataBlock.level}
          id="Level"
          type="number"
          label="Cấp độ"
          name="level"
        />
        <Autocomplete
          disablePortal
          id="category"
          fullWidth
          options={category}
          value={
            category.find((option) => option.group_id === dataBlock.group_id) ||
            null
          }
          getOptionLabel={(option) => option.name}
          renderInput={(params) => (
            <TextField {...params} label="Danh Mục" id="id" />
          )}
          onChange={(e, val) => setCategoryValue(val?.group_id)}
        />
        <div>
          <BlocklyLayout setDataBlocks={setDataBlocks} data={dataBlock.data} />
        </div>
        <Button type="submit" variant="contained" sx={{ mt: 3, mb: 2 }}>
          Submit
        </Button>
      </Box>
    </>
  );
};
