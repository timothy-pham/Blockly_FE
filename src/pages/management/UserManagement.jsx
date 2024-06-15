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
  Chip,
  Autocomplete,
} from "@mui/material";
import TablePaginationActions from "@mui/material/TablePagination/TablePaginationActions";
import React, { useEffect, useRef, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import {
  fetchData,
  apiPost,
  updateData,
  deleteData,
  getToken,
} from "../../utils/dataProvider";
import { getCurrentDateTime } from "../../utils/generate";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import { toastOptions } from "../../constant/toast";
import AutorenewIcon from "@mui/icons-material/Autorenew";

const userRole = {
  teacher: "Giáo viên",
  parent: "Phụ huynh",
  student: "Học sinh",
  admin: "Admin",
};

const roles = [
  { value: "admin", name: "Admin" },
  { value: "teacher", name: "Giáo viên" },
  { value: "parent", name: "Phụ huynh" },
  { value: "student", name: "Học sinh" },
];
export const UserManagement = () => {
  const info = localStorage.getItem("authToken");
  const { user } = JSON.parse(info);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [openPopup, setOpenPopup] = useState(false);
  const [openPopupAssign, setOpenPopupAssign] = useState(false);
  const [open, setOpen] = useState(false);
  const [openAssign, setOpenAssign] = useState(false);
  const [rows, setRows] = useState([]);
  const [data, setData] = useState({ name: "", description: "" });
  const [refresh, setRefresh] = React.useState(false);
  const [teacher, setTeacher] = React.useState();
  const [openPopupPermission, setOpenPopupPermission] = useState(false);
  const [parent, setParent] = React.useState();
  const [role, setRole] = React.useState();
  const [roleFilter, setRoleFilter] = useState(null);

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

  const handleSubmitPermission = async (event) => {
    event.preventDefault();
    let res;
    if (!role) {
      toast.error(`Vui lòng chọn quyền để gán.`, toastOptions);
    } else {
      try {
        res = await updateData(`users`, data.user_id, { role });
        if (res) {
          toast.success(`Thay đổi quyền thành công.`, toastOptions);
        }
        setData({});
      } catch (err) {
        toast.error(
          `Có lỗi trong lúc thay đổi quyền. Vui lòng kiểm tra lại.`,
          toastOptions
        );
      } finally {
        setRefresh(!refresh);
        setOpenPopupPermission(false);
        setRole(null);
      }
    }
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
        res = await apiPost(`users/${endpoint}/${teacher}`, requestData);
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

  const handleSubmitAssign = async (event) => {
    event.preventDefault();
    let res;
    if (!parent) {
      toast.error(`Vui lòng chọn phụ huynh để gán.`, toastOptions);
    } else {
      try {
        res = await apiPost(`users/addStudentToParent/${parent}`, {
          student_id: data?.user_id,
        });
        if (res) {
          toast.success(
            `Thêm học sinh cho phụ huynh thành công.`,
            toastOptions
          );
        }
        setData({});
      } catch (err) {
        toast.error(
          `Có lỗi trong lúc thêm học sinh cho phụ huynh. Vui lòng kiểm tra lại.`,
          toastOptions
        );
      } finally {
        setRefresh(!refresh);
        setOpenPopupAssign(false);
        setParent(null);
      }
    }
  };

  const handleDeleteAssign = async () => {
    try {
      let res;
      res = await apiPost(
        `users/removeStudentFromParent/${data?.meta_data?.parent}`,
        { student_id: data?.user_id }
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
      setOpenAssign(false);
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
      res = await apiPost(
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

  const colorMap = {
    teacher: "primary",
    parent: "secondary",
    student: "default",
  };

  function getColor(role) {
    return colorMap[role] || "default";
  }

  const handleRoleFilterChange = (event, newValue) => {
    setRoleFilter(newValue);
  };

  const filteredRows = roleFilter
    ? rows.filter((row) => row.role === roleFilter.value)
    : rows;

  return (
    <>
      <TableContainer sx={{ padding: 3 }} component={Paper}>
        <div className="flex justify-between">
          <Typography variant="h6">Quản lí người dùng</Typography>
          <Autocomplete
            value={roleFilter}
            onChange={handleRoleFilterChange}
            options={roles}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) =>
              option.value === value?.value
            }
            renderInput={(params) => (
              <TextField {...params} label="Lọc theo quyền" />
            )}
            sx={{ width: 200 }}
          />
        </div>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow className="[&>*]:font-bold">
              <TableCell>Tên</TableCell>
              <TableCell>Tên đăng nhập</TableCell>
              <TableCell>Vai trò</TableCell>
              <TableCell>Giáo viên</TableCell>
              <TableCell>Phụ huynh</TableCell>
              <TableCell>Học sinh</TableCell>
              {user.role === "admin" && <TableCell>Gán PH/HS với GV</TableCell>}
              <TableCell>Gán PH với HS</TableCell>
              {user.role === "admin" && <TableCell>Thay đổi quyền</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? filteredRows.slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage
              )
              : filteredRows
            ).map((row, index) => (
              <TableRow key={index}>
                <TableCell component="th" scope="row">
                  {row?.name}
                </TableCell>
                <TableCell>{row?.username}</TableCell>
                <TableCell>{userRole[row?.role]}</TableCell>
                <TableCell>
                  {(Array.isArray(row?.meta_data?.teachers)
                    ? row.meta_data.teachers
                    : [row.meta_data?.teacher]
                  ).map((teacherId, index) => {
                    const name = rows.find(
                      (v) => v.user_id === teacherId
                    )?.name;
                    return name ? (
                      <Chip
                        key={index}
                        label={name}
                        color={getColor("teacher")}
                        style={{ margin: 2 }}
                      />
                    ) : null;
                  })}
                </TableCell>
                <TableCell>
                  {(Array.isArray(row?.meta_data?.parents)
                    ? row.meta_data.parents
                    : [row.meta_data?.parent]
                  ).map((parentId, index) => {
                    const name = rows.find((v) => v.user_id === parentId)?.name;
                    return name ? (
                      <Chip
                        key={index}
                        label={name}
                        color={getColor("parent")}
                        style={{ margin: 2 }}
                      />
                    ) : null;
                  })}
                </TableCell>
                <TableCell>
                  {(Array.isArray(row?.meta_data?.students)
                    ? row.meta_data.students
                    : [row.meta_data?.student]
                  ).map((studentId, index) => {
                    const name = rows.find(
                      (v) => v.user_id === studentId
                    )?.name;
                    return name ? (
                      <Chip
                        key={index}
                        label={name}
                        color={getColor("student")}
                        style={{ margin: 2 }}
                      />
                    ) : null;
                  })}
                </TableCell>
                {user.role === "admin" && (
                  <TableCell>
                    {(row.role === "student" || row.role === "parent") && (
                      <IconButton
                        title="Gán PH/HS - GV"
                        onClick={() => {
                          setOpenPopup(true);
                          setData(row);
                        }}
                      >
                        <ModeEditIcon />
                      </IconButton>
                    )}
                    {row.meta_data.teacher && (
                      <IconButton
                        onClick={() => {
                          setData(row);
                          setOpen(true);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </TableCell>
                )}
                <TableCell>
                  {row.role === "student" && (
                    <IconButton
                      title="Gán PH - HS"
                      onClick={() => {
                        setOpenPopupAssign(true);
                        setData(row);
                      }}
                    >
                      <AutorenewIcon />
                    </IconButton>
                  )}
                  {row.role === "student" && row.meta_data.parent && (
                    <IconButton
                      onClick={() => {
                        setData(row);
                        setOpenAssign(true);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </TableCell>
                <TableCell>
                  {user.role === "admin" && (
                    <IconButton
                      title="thay đổi quyền"
                      onClick={() => {
                        setOpenPopupPermission(true);
                        setData(row);
                      }}
                    >
                      <ModeEditIcon />
                    </IconButton>
                  )}
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
        open={openPopupPermission}
        onClose={() => {
          setData({});
          setOpenPopupPermission(false);
          setRole(false);
        }}
      >
        Thay đổi quyền
        <Box
          className="flex flex-col items-center"
          component="form"
          defaultValue={data}
          onSubmit={handleSubmitPermission}
          sx={{ mt: 1 }}
        >
          <Select
            native
            fullWidth
            onChange={(e) => {
              setRole(e.target.value);
            }}
            defaultValue={data?.role || null}
          >
            <option value="">Chọn quyền</option>
            {roles.map(
              (row) =>
                row.value !== data.role && (
                  <option value={row.value}>{row.name}</option>
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
        maxWidth="md"
        open={openPopup}
        onClose={() => {
          setData({});
          setOpenPopup(false);
        }}
      >
        Gán học sinh và phụ huynh vào lớp của giáo viên
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
            <option value="">Chọn giáo viên</option>
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
        maxWidth="md"
        open={openPopupAssign}
        onClose={() => {
          setData({});
          setParent(null);
          setOpenPopupAssign(false);
        }}
      >
        Gán học sinh cho phụ huynh
        <Box
          className="flex flex-col items-center"
          component="form"
          defaultValue={data}
          onSubmit={handleSubmitAssign}
          sx={{ mt: 1 }}
        >
          <Select
            native
            fullWidth
            onChange={(e) => {
              setParent(e.target.value);
            }}
            defaultValue={data?.meta_data?.parent_id || null}
          >
            <option value="">Chọn phụ huynh</option>
            {rows.map(
              (row) =>
                row.role == "parent" && (
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
        open={openAssign}
        onClose={() => {
          setData({});
          setOpenAssign(false);
        }}
      >
        <span>
          Xác nhận để gán phụ huynh của tài khoản{" "}
          <span style={{ color: "red" }}>{data.name}</span>
        </span>
        <Button
          onClick={handleDeleteAssign}
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Xác nhận
        </Button>
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
          Xác nhận để gán giáo viên của tài khoản{" "}
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
