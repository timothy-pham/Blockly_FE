import {
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
} from "@mui/material"
import TablePaginationActions from "@mui/material/TablePagination/TablePaginationActions"
import React, { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

import { post, fetchData } from "../../utils/dataProvider"

const userRole = {
  teacher: "Giáo viên",
  parent: "Phụ huynh",
  student: "Học sinh",
  admin: "Admin",
}

const roles = [
  { value: "teacher", name: "Giáo viên" },
  { value: "parent", name: "Phụ huynh" },
  { value: "student", name: "Học sinh" },
]
const ClassHome = () => {
  const info = localStorage.getItem("authToken")
  const { user } = JSON.parse(info)
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(10)
  const [rows, setRows] = useState([])
  const [refresh, setRefresh] = React.useState(false)
  const [roleFilter, setRoleFilter] = useState(null)
  const navigate = useNavigate()

  const fetchCollection = async () => {
    try {
      const teacher_id =
        user.role === "teacher" ? user.user_id : user?.meta_data?.teacher
      if (teacher_id) {
        const res = await fetchData(`users/class/${teacher_id}`)
        if (res) {
          setRows(res)
        }
      }
    } catch (e) {
      console.log("can not fetch users")
    }
  }

  useEffect(() => {
    fetchCollection()
  }, [refresh])

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const colorMap = {
    teacher: "primary",
    parent: "secondary",
    student: "default",
  }

  function getColor(role) {
    return colorMap[role] || "default"
  }

  const handleRoleFilterChange = (event, newValue) => {
    setRoleFilter(newValue)
  }

  const filteredRows = roleFilter
    ? rows.filter((row) => row.role === roleFilter.value)
    : rows

  const handleStartChat = async (receiver_id) => {
    try {
      const res = await post("messages", {
        type: "private",
        users: [receiver_id],
      })
      if (res) {
        navigate(`/messages?chat_id=${res.message_id}`)
      }
    } catch (error) {
      console.log("can not start chat", error)
    }
  }
  return (
    <>
      <TableContainer sx={{ padding: 3 }} component={Paper}>
        <div className="flex justify-between">
          <Typography variant="h6">Danh sách thành viên trong lớp</Typography>
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
              <TableCell>Tên đăng nhập</TableCell>
              <TableCell>Tên</TableCell>
              <TableCell>Vai trò</TableCell>
              <TableCell>Điểm tích luỹ</TableCell>
              <TableCell>Số trận đã tham gia</TableCell>
              <TableCell>Phụ huynh</TableCell>
              <TableCell>Học sinh</TableCell>
              <TableCell>Liên hệ</TableCell>
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
                  {row?.username}
                </TableCell>
                <TableCell>{row?.name}</TableCell>
                <TableCell>{userRole[row?.role]}</TableCell>
                <TableCell>{row?.meta_data?.points || 0}</TableCell>
                <TableCell>{row?.meta_data?.matches || 0}</TableCell>
                <TableCell>
                  {(Array.isArray(row?.meta_data?.parents)
                    ? row.meta_data.parents
                    : [row.meta_data?.parent]
                  ).map((parentId, index) => {
                    const name = rows.find((v) => v.user_id === parentId)?.name
                    return name ? (
                      <Chip
                        key={index}
                        label={name}
                        color={getColor("parent")}
                        style={{ margin: 2 }}
                      />
                    ) : null
                  })}
                </TableCell>
                <TableCell>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
                    {(Array.isArray(row?.meta_data?.students)
                      ? row.meta_data.students
                      : [row.meta_data?.student]
                    ).map((studentId, index) => {
                      const name = rows.find(
                        (v) => v.user_id === studentId
                      )?.name
                      return name ? (
                        <Chip
                          key={index}
                          label={name}
                          color={getColor("student")}
                          style={{ margin: 2 }}
                        />
                      ) : null
                    })}
                  </div>
                </TableCell>

                <TableCell>
                  {user.user_id !== row.user_id ? (
                    <IconButton
                      title="Nhắn tin"
                      onClick={() => {
                        handleStartChat(row.user_id)
                      }}
                      sx={{
                        color: "white",
                        width: "auto",
                      }}
                    >
                      <Typography
                        sx={{
                          backgroundColor: "#3f51b5",
                          padding: 1,
                          borderRadius: 2,
                        }}
                      >
                        Nhắn tin
                      </Typography>
                    </IconButton>
                  ) : (
                    <></>
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
    </>
  )
}

export default ClassHome
