import { BlocklyLayout } from "../../../components/Blockly";
import {
  Button,
  Dialog,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Box,
  TextField,
  Autocomplete,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import {
  fetchData,
  createData,
  updateData,
  deleteData,
} from "../../../utils/dataProvider";

export const CreateBlock = () => {
  const [dataBlock, setDataBlocks] = useState();

  const handleSubmit = async (event, asd) => {
    event.preventDefault();
    const dataForm = new FormData(event.currentTarget);
    try {
      await createData("blocks", {
        name: dataForm.get("name"),
        question: dataForm.get("question"),
        level: dataForm.get("level"),
        data: dataBlock.data,
        answers: dataBlock.code,
        meta_data: {
          description: dataForm.get("description"),
        },
      });
    } catch (err) {
      console.log("can not create block");
    } finally {
    }
    console.log("submit");
  };
  return (
    <>
      Tạo Block
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
          autoFocus
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="Level"
          type="number"
          label="cấp độ"
          name="level"
          autoFocus
        />
        {/* <Autocomplete
        disablePortal
        id="collections"
        fullWidth
        options={collection}
        getOptionLabel={(option) => option.name}
        renderInput={(params) => (
          <TextField {...params} label="Danh Mục" id="id" />
        )}
        onChange={(e, val) => setCollectionValue(val?.collection_id)}
        renderOption={(props, option) => (
          <div {...props}>
          <h3>{option?.name}</h3>
          </div>
        )}
      /> */}

        <div>
          <BlocklyLayout setDataBlocks={setDataBlocks} />
        </div>
        <Button type="submit" variant="contained" sx={{ mt: 3, mb: 2 }}>
          Submit
        </Button>
      </Box>
    </>
  );
};
