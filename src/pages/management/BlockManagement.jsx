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
  Chip,
} from "@mui/material";
import TablePaginationActions from "@mui/material/TablePagination/TablePaginationActions";
import React, { useEffect, useState, useRef } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import {
  fetchData,
  createData,
  updateData,
  deleteData,
  getToken,
} from "../../utils/dataProvider";
import { saveAs } from "file-saver";
import { getCurrentDateTime } from "../../utils/generate";

export const BlockManagement = () => {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [data, setData] = useState({ name: "", description: "" });

  const [refresh, setRefresh] = React.useState(false);

  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const fetchBlocks = async () => {
    try {
      const res = await fetchData("blocks");
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
      await deleteData("blocks", data.block_id);
    } catch (err) {
      console.log("can not delete collection");
    } finally {
      setRefresh(!refresh);
      setOpen(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          await handleImport(JSON.parse(e.target.result));
        } catch (error) {
          console.error("Error parsing JSON:", error);
        } finally {
          event.target.value = "";
        }
      };
      reader.readAsText(file);
    }
  };

  const handleImport = async (file) => {
    try {
      await createData("blocks/import", file);
    } catch (err) {
      console.log("can not create block");
    } finally {
      setRefresh(!refresh);
    }
  };

  const handleExport = async (url) => {
    fetch(`${process.env.REACT_APP_API_URL}/blocks/export`, {
      headers: {
        Authorization: getToken(),
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.blob())
      .then((blob) => {
        var _url = window.URL.createObjectURL(blob);
        saveAs(_url, `blockData-${getCurrentDateTime()}.json`);
        // window.open(_url, "_blank").focus(); // window.open + focus
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      <div className="w-fullflex flex-col justify-center">
        <TableContainer sx={{ boxShadow: "none" }} component={Paper}>
          <div className="flex justify-between">
            <Typography variant="h6">Quản lí câu hỏi</Typography>
            <div>
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                <Button
                  color="primary"
                  variant="contained"
                  size="small"
                  onClick={handleButtonClick}
                  sx={{ marginRight: 2 }}
                >
                  Import JSON
                </Button>
              </>
              <Button
                color="primary"
                variant="contained"
                size="small"
                component="a"
                onClick={handleExport}
                target="_blank"
                sx={{ marginRight: 2 }}
              >
                Export Json
              </Button>
              <Button
                color="primary"
                variant="contained"
                size="small"
                component="a"
                startIcon={<AddIcon />}
                onClick={() => navigate("/blockManagement/create")}
              >
                Thêm mới
              </Button>
            </div>
          </div>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow className="[&>*]:font-bold">
                <TableCell>Tên Block</TableCell>
                <TableCell>Câu hỏi</TableCell>
                <TableCell>Tên bài tập</TableCell>
                <TableCell>Cấp độ</TableCell>
                <TableCell>Hành động</TableCell>
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
                  <TableCell>{row?.group.name}</TableCell>
                  <TableCell>
                    <Chip
                      color={
                        row?.level === 1
                          ? "success"
                          : row?.level === 2
                          ? "warning"
                          : "error"
                      }
                      label={
                        row?.level === 1
                          ? "Dễ"
                          : row?.level === 2
                          ? "Bình thường"
                          : "Khó"
                      }
                      sx={{ width: "fit-content" }}
                    />
         
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
          Xác nhận để xóa Block{" "}
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
