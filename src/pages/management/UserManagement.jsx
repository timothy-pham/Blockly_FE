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
  Select,
} from "@mui/material";
import TablePaginationActions from "@mui/material/TablePagination/TablePaginationActions";
import React, { useEffect, useRef, useState } from "react";
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
import { getCurrentDateTime } from "../../utils/generate";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import { toastOptions } from "../../constant/toast";

export const UserManagement = () => {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [openPopup, setOpenPopup] = useState(false);
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [data, setData] = useState({ name: "", description: "" });
  const [refresh, setRefresh] = React.useState(false);
  const [teacher, setTeacher] = React.useState();

  const fetchCollection = async () => {
    try {
      const res = await fetchData("users");
      if (res) {
        setRows(res);
      }
    } catch (e) {
      console.log("can not fetch users");
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
    let res;
    if (!teacher) {
      toast.error(`Vui lòng chọn giáo viên để gán.`, toastOptions);
    } else {
      try {
        const endpoint =
          data.role === "parent" ? "addParentToTeacher" : "addStudentToTeacher";
        const requestData =
          data.role === "parent"
            ? { parent_id: data?.user_id }
            : { student_id: data?.user_id };
        res = await createData(`users/${endpoint}/${teacher}`, requestData);
        if (res) {
          toast.success(
            `Thêm học sinh cho giáo viên thành công.`,
            toastOptions
          );
        }
        setData({});
      } catch (err) {
        toast.error(
          `Có lỗi trong lúc thêm học sinh cho giáo viên. Vui lòng kiểm tra lại.`,
          toastOptions
        );
      } finally {
        setRefresh(!refresh);
        setOpenPopup(false);
        setTeacher(null);
      }
    }
  };

  const handleDelete = async () => {
    try {
      let res;

      const endpoint =
        data.role === "parent"
          ? "removeParentFromTeacher"
          : "removeStudentFromTeacher";
      const requestData =
        data.role === "parent"
          ? { parent_id: data?.user_id }
          : { student_id: data?.user_id };
      res = await createData(
        `users/${endpoint}/${data?.meta_data?.teacher}`,
        requestData
      );
      if (res) {
        toast.success(`Xóa gán thành công.`, toastOptions);
      }
    } catch (err) {
      toast.error(
        `Có lỗi trong lúc xóa  gán. Vui lòng kiểm tra lại.`,
        toastOptions
      );
    } finally {
      setRefresh(!refresh);
      setOpen(false);
    }
  };

  return (
    <>
      <TableContainer sx={{ padding: 3 }} component={Paper}>
        <div className="flex justify-between">
          <Typography variant="h6">Gán phụ huynh học sinh</Typography>
        </div>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow className="[&>*]:font-bold">
              <TableCell>Tên</TableCell>
              <TableCell>Tên đăng nhập</TableCell>
              <TableCell>Vai trò</TableCell>
              <TableCell>Thuộc giáo viên</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : rows
            ).map((row, index) => (
              <TableRow key={index}>
                <TableCell component="th" scope="row">
                  {row?.name}
                </TableCell>
                <TableCell>{row?.username}</TableCell>
                <TableCell>{row?.role}</TableCell>
                <TableCell>
                  {
                    rows.find((v) => v.user_id === row?.meta_data?.teacher)
                      ?.name
                  }
                </TableCell>

                <TableCell>
                  <IconButton
                    onClick={() => {
                      setOpenPopup(true);
                      setData(row);
                    }}
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
        Gán học sinh vào lớp của giáo viên
        <Box
          className="flex flex-col items-center"
          component="form"
          defaultValue={data}
          onSubmit={handleSubmit}
          sx={{ mt: 1 }}
        >
          <Select
            native
            fullWidth
            inputProps={{
              name: "teacher",
              id: "teacher",
            }}
            onChange={(e) => {
              setTeacher(e.target.value);
            }}
            defaultValue={data?.meta_data?.teacher || null}
          >
            <option value="">Select a teacher</option>
            {rows.map(
              (row) =>
                row.role == "teacher" && (
                  <option value={row.user_id}>{row.name}</option>
                )
            )}
          </Select>
          <Button type="submit" variant="contained" sx={{ mt: 3, mb: 2 }}>
            Lưu
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
          setTeacher(null);
        }}
      >
        <span>
          Xác nhận để gán của tài khoản{" "}
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
