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
import TablePaginationActions from "@mui/material/TablePagination/TablePaginationActions";
import React, { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import {
  fetchData,
  createData,
  updateData,
  deleteData,
} from "../../utils/dataProvider";

export const BlockManagement = () => {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [openPopup, setOpenPopup] = useState(false);
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [collection, setCollection] = useState([]);
  const [collectionValue, setCollectionValue] = useState();
  const [data, setData] = useState({ name: "", description: "" });

  const [refresh, setRefresh] = React.useState(false);

  const fetchBlocks = async () => {
    try {
      const res = await fetchData("blocks");
      console.log("res", res);
      if (res) {
        setRows(res);
      }
    } catch (e) {
      console.log("can not fetch groups");
    }
  };

  useEffect(() => {
    fetchBlocks();
  }, [refresh]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async () => {
    try {
      await deleteData("groups", data.collection_id);
    } catch (err) {
      console.log("can not delete collection");
    } finally {
      setRefresh(!refresh);
      setOpen(false);
    }
  };

  return (
    <>
      <div className="w-fullflex flex-col justify-center">
        <TableContainer sx={{ boxShadow: "none" }} component={Paper}>
          <div className="flex justify-between">
            <Typography variant="h6">Blocks Management</Typography>
            <Button
              color="primary"
              variant="contained"
              size="small"
              component="a"
              startIcon={<AddIcon />}
              onClick={() => navigate("/blockManagement/create")}
            >
              Create
            </Button>
          </div>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow className="[&>*]:font-bold">
                <TableCell>Name</TableCell>
                <TableCell>Question</TableCell>
                <TableCell>Level</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(rowsPerPage > 0
                ? rows.slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage
                  )
                : rows
              ).map((row, index) => (
                <TableRow key={index}>
                  <TableCell component="th" scope="row">
                    {row?.name}
                  </TableCell>
                  <TableCell>{row?.question}</TableCell>
                  <TableCell>
                    {row.level}
                    {/* {
                      collection?.find(
                        (v) => v?.collection_id == row?.collection_id
                      )?.name
                    } */}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() =>
                        navigate(`/blockManagement/${row.block_id}/edit`)
                      }
                    >
                      <ModeEditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        setData(row);
                        setOpen(true);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                  count={rows.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  slotProps={{
                    select: {
                      inputProps: {
                        "aria-label": "rows per page",
                      },
                      native: true,
                    },
                  }}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  ActionsComponent={TablePaginationActions}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </div>
    </>
  );
};
