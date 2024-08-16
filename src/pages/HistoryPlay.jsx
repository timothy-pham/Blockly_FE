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
import { apiGet } from "../utils/dataProvider";
import { formatDateTime, formatTime } from "../utils/transform";

export const HistoryPlay = () => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [rows, setRows] = useState([]);
  const [groups, setGroups] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const info = localStorage.getItem("authToken");
  const { user } = JSON.parse(info);
  const id = user?.user_id;

  const fetchHistory = async () => {
    try {
      const res = await apiGet("rooms/histories/" + id);
      if (res) {
        setRows(res);
      }
    } catch (e) {
      console.log("can not fetch history");
    }
  };

  const fetchStatistics = async () => {
    try {
      const res = await apiGet("rooms/statistics/" + id);
      if (res) {
        setStatistics(res);
      }
    } catch (e) {
      console.log("can not fetch history");
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await apiGet("groups");
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
    fetchStatistics();
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

  const findPoints = (userId, data, roomId) => {
    if (!Array.isArray(data)) {
      console.error("Invalid data: Expected an array.");
      return 0;
    }

    const userDetails = data.find((user) => user.user_id === userId);

    const pointsHistory = userDetails?.user_data?.meta_data?.points_history;
    if (!Array.isArray(pointsHistory)) {
      console.warn("Points history is not available or not an array.");
      return 0;
    }

    const pointsRecord = pointsHistory.find((v) => v.room_id === roomId);
    if (!pointsRecord) {
      console.warn(`No points record found for room_id: ${roomId}`);
      return 0;
    }

    return pointsRecord.points ?? 0;
  };

  return (
    <div class="container-body">
      <TableContainer sx={{
        padding: 3,
        width: "80%",
        backgroundColor: "var(--black)",
        borderRadius: "10px",
        border: "1px solid var(--red)",
        color: "var(--red)",
        "& .MuiTableCell-root": {
          color: "var(--red)",
          fontSize: "18px",
          textAlign: "start",
        },
      }} component={Paper}>
        <div className="flex flex-col items-center">
          <Typography variant="h5" sx={{
            color: "var(--red)",
            borderBottom: "2px solid var(--red)",
            width: "fit-content",
            padding: "5px"
          }}>Lịch sử thi đấu</Typography>
          <div>
            <div style={{
              display: "flex",
              justifyContent: "center",
              color: "var(--red)",
              textAlign: "start",
              gap: "5rem",
              fontSize: "1rem",
              marginTop: "1.5rem",
            }}>
              <div>
                <p>
                  Tổng số trận đã đấu: {statistics?.total_matches}
                </p>
                <p>
                  Tổng số điểm: {statistics?.total_points}
                </p>
              </div>
              <div>
                <p>
                  Điểm trung bình mỗi bài: {statistics?.avg_scores}
                </p>
                <p>
                  Tổng thời gian đã thi đấu: {formatTime(statistics?.total_time, true)}
                </p>
              </div>
              <div>
                <p>
                  Thứ hạng trung bình: {Math.round(statistics?.avg_rank)}
                </p>
                <p>
                  Thời gian trung bình mỗi trận: {formatTime(statistics?.avg_time, true)}
                </p>
              </div>
            </div>
          </div>
        </div>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow className="[&>*]:font-bold">
              <TableCell>Tên phòng</TableCell>
              <TableCell>Tên bài tập</TableCell>
              <TableCell>Điểm số</TableCell>
              <TableCell>Thời gian tham gia</TableCell>
              <TableCell>Thứ hạng/ Tổng số người</TableCell>
              <TableCell>Điểm tích lũy</TableCell>
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
                <TableCell>{findPoints(id, row.users, row.room_id)}</TableCell>
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
  );
};
