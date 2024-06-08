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

export const History = () => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [rows, setRows] = useState([]);

  const [refresh, setRefresh] = React.useState(false);

  const fetchHistory = async () => {
    try {
      const res = await fetchData("histories");
      if (res) {
        setRows(res);
      }
    } catch (e) {
      console.log("can not fetch history");
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [refresh]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <TableContainer sx={{ padding: 3 }} component={Paper}>
      <div className="flex justify-between">
        <Typography variant="h6">Lịch sử luyện tập</Typography>
      </div>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow className="[&>*]:font-bold">
            <TableCell>Tên danh mục</TableCell>
            <TableCell>Tên bài tập</TableCell>
            <TableCell>Điểm số</TableCell>
            <TableCell>Thời gian tham gia</TableCell>
            <TableCell>Thời gian cập nhật</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(rowsPerPage > 0
            ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            : rows
          ).map((row, index) => (
            <TableRow key={index}>
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
              <TableCell>{formatDateTime(row?.meta_data?.end_time)}</TableCell>
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
