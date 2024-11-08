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
import { useParams, useNavigate } from "react-router-dom";
export const History = () => {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [rows, setRows] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [refresh, setRefresh] = React.useState(false);

  const fetchHistory = async () => {
    try {
      const res = await apiGet("histories");
      if (res) {
        setRows(res);
      }
    } catch (e) {
      console.log("can not fetch history");
    }
  };

  const fetchStatistics = async () => {
    try {
      const res = await apiGet("histories/statistics");
      if (res) {
        setStatistics(res);
      }
    } catch (e) {
      console.log("can not fetch statistics");
    }
  };

  useEffect(() => {
    fetchHistory();
    fetchStatistics();
  }, [refresh]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div className="container-body">
      <TableContainer
        sx={{
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
        }}
        component={Paper}
      >
        <div className="flex flex-col items-center">
          <Typography
            variant="h5"
            sx={{
              color: "var(--red)",
              borderBottom: "2px solid var(--red)",
              width: "fit-content",
              padding: "5px",
            }}
          >
            Lịch sử luyện tập
          </Typography>
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                color: "var(--red)",
                textAlign: "start",
                gap: "5rem",
                fontSize: "1rem",
                marginTop: "1.5rem",
              }}
            >
              <div>
                <p>Số câu hỏi đã làm đúng: {statistics?.total_score}</p>
                <p>
                  Tổng thời gian đã làm:{" "}
                  {formatTime(statistics?.total_time, true)}
                </p>
              </div>
              <div>
                <p>Điểm trung bình mỗi bài: {statistics?.avg_score.toFixed(2)}</p>
                <p>
                  Thời gian trung bình mỗi bài:{" "}
                  {formatTime(statistics?.avg_time, true)}
                </p>
              </div>
            </div>
          </div>
        </div>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow className="[&>*]:font-bold">
              <TableCell
                sx={{
                  color: "var(--red)",
                }}
              >
                Tên danh mục
              </TableCell>
              <TableCell>Tên bài tập</TableCell>
              <TableCell>Điểm số</TableCell>
              <TableCell>Thời gian bắt đầu</TableCell>
              <TableCell>Thời gian kết thúc</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : rows
            ).map((row, index) => (
              <TableRow key={index}
                sx={{
                  // hover
                  "&:hover": {
                    backgroundColor: "var(--gray)",
                    color: "var(--black)",
                  },
                }}
                onClick={() => {
                  navigate(`/review/${row?.histories_id}`);
                }}
              >
                <TableCell component="th" scope="row">
                  {row?.collection?.name}
                </TableCell>
                <TableCell>{row?.group?.name}</TableCell>
                <TableCell>
                  {row?.meta_data?.score ? row?.meta_data?.score : 0}/
                  {row?.meta_data?.total}
                </TableCell>
                <TableCell>
                  {formatDateTime(row?.meta_data?.start_time)}
                </TableCell>
                <TableCell>
                  {formatDateTime(row?.meta_data?.end_time)}
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
                sx={{
                  "& .MuiTablePagination-actions button": {
                    color: "var(--red)",
                  },
                  "& .MuiTablePagination-selectIcon": {
                    color: "var(--red)",
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
