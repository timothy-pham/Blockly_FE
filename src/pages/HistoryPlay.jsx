import {
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
} from "@mui/material";
import TablePaginationActions from "@mui/material/TablePagination/TablePaginationActions";
import React, { useEffect, useState } from "react";
import { fetchData } from "../utils/dataProvider";
import { formatDateTime } from "../utils/transform";

export const HistoryPlay = () => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [rows, setRows] = useState([]);
  const [groups, setGroups] = useState([]);
  const info = localStorage.getItem("authToken");
  const { user } = JSON.parse(info);
  const id = user?.user_id;
  const fetchHistory = async () => {
    try {
      const res = await fetchData("rooms/histories/" + id);
      if (res) {
        setRows(res);
      }
    } catch (e) {
      console.log("can not fetch history");
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await fetchData("groups");
      if (res) {
        setGroups(res);
      }
    } catch (e) {
      console.log("can not fetch history");
    }
  };

  useEffect(() => {
    fetchHistory();
    fetchGroups();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const findRank = (userId, data) => {
    const sortedData = data.sort((a, b) => b.score - a.score);
    const userIndex = sortedData.findIndex((user) => user.user_id === userId);

    const rank = userIndex + 1;

    return rank;
  };

  return (
    <TableContainer sx={{ padding: 3 }} component={Paper}>
      <div className="flex justify-between">
        <Typography variant="h6">Lịch sử thi đấu</Typography>
      </div>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow className="[&>*]:font-bold">
            <TableCell>Tên phòng</TableCell>
            <TableCell>Tên bài tập</TableCell>
            <TableCell>Điểm số</TableCell>
            <TableCell>Thời gian tham gia</TableCell>
            <TableCell>Thứ hạng/ Tổng số người</TableCell>
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
              <TableCell>
                {
                  groups.find((v) => v?.group_id == row?.meta_data?.group_id)
                    ?.name
                }
              </TableCell>
              <TableCell>
                {
                  row.users.find((v) => {
                    if (v.user_id === id) {
                      return v;
                    }
                  }).score
                }
                / {row?.meta_data?.blocks.length}
              </TableCell>
              <TableCell>{formatDateTime(row?.created_at)}</TableCell>
              <TableCell>
                {findRank(id, row.users)}/{row.users.length}
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
  );
};
