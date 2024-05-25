import { BlocklyLayout } from "../../../components/Blockly";
import {
  Button,
  Box,
  TextField,
  Autocomplete,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { createData } from "../../../utils/dataProvider";
import { transformCodeBlockly } from "../../../utils/transform";

export const CreateBlock = () => {
  const [dataBlock, setDataBlocks] = useState(null);
  const [answers, setAnswers] = useState("");
  const [showAnswers, setShowAnswers] = useState(false);

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
    try {
      await createData("blocks", {
        name: dataForm.get("name"),
        question: dataForm.get("question"),
        level: dataForm.get("level"),
        type: dataForm.get("type"),
        data: dataBlock?.data,
        answers: transformCodeBlockly(answers),
        meta_data: {
          description: dataForm.get("description"),
        },
      });
    } catch (err) {
      console.log("Cannot create block");
    }
  };

  return (
    <>
      <Typography variant="h4">Tạo Block</Typography>
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
            Preview
          </Button>
          {showAnswers && (
            <TextField
              margin="normal"
              required
              fullWidth
              value={answers}
              multiline
              onChange={handleAnswersChange}
              id="Answers"
              label="Đáp án"
              name="answers"
            />
          )}
        </>
        <Button type="submit" variant="contained" sx={{ mt: 3, mb: 2 }}>
          Submit
        </Button>
      </Box>
    </>
  );
};
