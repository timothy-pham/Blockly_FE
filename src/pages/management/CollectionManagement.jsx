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

export const CollectionManagement = () => {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [openPopup, setOpenPopup] = useState(false);
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [data, setData] = useState({ name: "", description: "" });

  const [refresh, setRefresh] = React.useState(false);

  const fetchCollection = async () => {
    try {
      const res = await fetchData("collections");
      console.log("res", res);
      if (res) {
        setRows(res);
      }
    } catch (e) {
      console.log("can not fetch collection");
    }
  };
  useEffect(() => {
    fetchCollection();
  }, [refresh]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const dataForm = new FormData(event.currentTarget);
    try {
      if (!data?.collection_id) {
        await createData("collections", {
          name: dataForm.get("name"),
          meta_data: {
            description: dataForm.get("description"),
          },
        });
      } else {
        await updateData("collections", data.collection_id, {
          name: dataForm.get("name"),
          meta_data: {
            description: dataForm.get("description"),
          },
        });
      }
    } catch (err) {
      console.log("can not create collection");
    } finally {
      setRefresh(!refresh);
      setOpenPopup(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteData("collections", data.collection_id);
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
            <Typography variant="h6">Collection Management</Typography>
            <Button
              color="primary"
              variant="contained"
              size="small"
              component="a"
              startIcon={<AddIcon />}
              onClick={() => setOpenPopup(true)}
            >
              Create
            </Button>
          </div>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow className="[&>*]:font-bold">
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
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
                  <TableCell>{row?.meta_data?.description}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => {
                        setOpenPopup(true);
                        setData(row);
                      }}
                    >
                      <ModeEditIcon />
                    </IconButton>
                    {/* <IconButton
                      onClick={() => {
                        //   axios.delete(
                        //     `http://localhost:3001/category/${row.id}`
                        //   );
                        setRefresh(true);
                      }}
                    >
                      <VisibilityIcon />
                    </IconButton> */}
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

      <Dialog
        sx={{
          "& .MuiDialog-paper": { width: "80%", padding: 5, maxHeight: 435 },
        }}
        maxWidth="md"
        open={openPopup}
        onClose={() => {
          setData({});
          setOpenPopup(false);
        }}
      >
        Tạo Collection
        <Box
          className="flex flex-col items-center"
          component="form"
          defaultValue={data}
          onSubmit={handleSubmit}
          sx={{ mt: 1 }}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            id="Name"
            label="Tên"
            name="name"
            defaultValue={data.name}
            autoFocus
          />
          <TextField
            margin="normal"
            fullWidth
            name="description"
            label="Mô tả"
            defaultValue={data.meta_data?.description}
            id="description"
            multiline
            rows={4}
          />
          <Button type="submit" variant="contained" sx={{ mt: 3, mb: 2 }}>
            Submit
          </Button>
        </Box>
      </Dialog>

      <Dialog
        sx={{
          "& .MuiDialog-paper": { width: "80%", padding: 5, maxHeight: 435 },
        }}
        // maxWidth="md"
        open={open}
        onClose={() => {
          setData({});
          setOpen(false);
        }}
      >
        <span>
          Xác nhận để xóa collection{" "}
          <span style={{ color: "red" }}>{data.name}</span>
        </span>
        <Button
          onClick={handleDelete}
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Xác nhận
        </Button>
      </Dialog>
    </>
  );
};
