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
  Chip,
  Box,
  TextField,
} from "@mui/material";
import TablePaginationActions from "@mui/material/TablePagination/TablePaginationActions";
import React, { useEffect, useRef, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import { apiGet, apiPost, apiPatch, apiDelete } from "../../utils/dataProvider";
import { toast } from "react-toastify";
import { toastOptions } from "../../constant/toast";
import { formatDateTime } from "../../utils/transform";
import CancelPresentationIcon from "@mui/icons-material/CancelPresentation";
import SendIcon from "@mui/icons-material/Send";
import LockOpenIcon from "@mui/icons-material/LockOpen";

export const TicketManagement = () => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [openPopup, setOpenPopup] = useState(false);
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [data, setData] = useState({});
  const [refresh, setRefresh] = React.useState(false);
  const fetchTicket = async () => {
    try {
      const res = await apiGet("tickets");
      if (res) {
        setRows(res);
      }
    } catch (e) {
      console.log("can not fetch collection");
    }
  };
  useEffect(() => {
    fetchTicket();
  }, [refresh]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleUpdate = async (row) => {
    try {
      console.log(row);
      const res = await apiPatch("tickets", row.ticket_id, {
        status: row.status !== "closed" ? "closed" : "open",
      });
      if (res) {
        toast.success(`Thay đổi trạng thái thành công.`, toastOptions);
      }
    } catch (err) {
      toast.error(
        `Có lỗi trong lúc thay đổi trạng thái. Vui lòng kiểm tra lại.`,
        toastOptions
      );
    } finally {
      setRefresh(!refresh);
    }
  };

  const handleOpenMesage = (row) => {
    setOpenPopup(true);
    setData(row);
  };

  const status = {
    open: {
      name: "Mở",
      color: "#83ec09",
    },
    responded: {
      name: "Đã trả lời",
      color: "#fc650d",
    },
    closed: {
      name: "Đóng",
      color: "#f70202",
    },
  };
  const getColor = (level) => {
    return status[`${level}`]?.color || "black";
  };

  const getLabel = (level) => {
    return status[`${level}`]?.name || "Không xác định";
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    let res;
    const dataForm = new FormData(e.currentTarget);

    try {
      res = await apiPost(`tickets/response/${data.ticket_id}`, {
        message: dataForm.get("message"),
      });

      if (res) {
        toast.success(`Gửi câu hỏi thành công.`, toastOptions);
      }
      setData({});
    } catch (err) {
      toast.error(
        `Có lỗi trong lúc gửi câu hỏi. Vui lòng kiểm tra lại.`,
        toastOptions
      );
    } finally {
      setRefresh(!refresh);
      setOpenPopup(false);
    }
  };

  return (
    <>
      <TableContainer sx={{ padding: 3 }} component={Paper}>
        <div className="flex justify-between">
          <Typography variant="h6">Quản lí phiếu hỗ trợ</Typography>
        </div>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow className="[&>*]:font-bold">
              <TableCell>ID</TableCell>
              <TableCell>Tiêu đề</TableCell>
              <TableCell>Lần cập nhật gần nhất</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : rows
            ).map((row, index) => (
              <TableRow
                key={index}
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.1)",
                  },
                }}
              >
                <TableCell component="th" scope="row">
                  {row?.ticket_id}
                </TableCell>
                <TableCell>{row?.title}</TableCell>

                <TableCell>{formatDateTime(row?.updated_at)}</TableCell>
                <TableCell>
                  <Chip
                    label={getLabel(row?.status)}
                    style={{
                      backgroundColor: getColor(row?.status),
                      color: "black",
                      fontWeight: "bold",
                    }}
                    sx={{ width: "fit-content" }}
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenMesage(row)}>
                    <SendIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      handleUpdate(row);
                    }}
                  >
                    {row.status !== "closed" ? (
                      <CancelPresentationIcon />
                    ) : (
                      <LockOpenIcon />
                    )}
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

      <Dialog
        sx={{
          "& .MuiDialog-paper": { width: "80%", padding: 5, maxHeight: "80%" },
        }}
        maxWidth="md"
        open={openPopup}
        onClose={() => {
          setData({});
          setOpenPopup(false);
        }}
      >
        <Typography variant="h5" sx={{ marginBottom: 5 }}>
          Thông tin chi tiết của phiếu : {data?.title}
        </Typography>

        <div
          style={{
            height: 400,
            overflowY: "auto",
          }}
        >
          {data?.messages?.map((item, index) => (
            <Box
              sx={{
                width: "100%",
                mb: 2,
                display: "flex",
                flexDirection: "column",
                alignItems:
                  item?.type === "request" ? "flex-start" : "flex-end",
              }}
              key={index}
            >
              <Typography variant="body2" color="textSecondary">
                {formatDateTime(item?.send_at)}
              </Typography>
              <Box
                sx={{
                  padding: 2,
                  borderRadius: 5,
                  border: "1px solid",
                  borderColor: "divider",
                  backgroundColor:
                    item?.type === "request" ? "#FEFAE0" : "#FAEDCE",
                  wordWrap: "break-word",
                  minHeight: 48,
                  textAlign: item?.type === "request" ? "left" : "right",
                }}
              >
                {item?.message}
              </Box>
            </Box>
          ))}
        </div>
        <Box
          className="flex flex-col items-center"
          component="form"
          defaultValue={data}
          onSubmit={handleSubmitTicket}
          sx={{ mt: 1 }}
        >
          <TextField
            margin="normal"
            fullWidth
            name="message"
            label="Trả lời"
            id="message"
            multiline
            rows={4}
          />

          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={data?.status === "closed"}
          >
            Gửi câu trả lời
          </Button>
        </Box>
      </Dialog>
    </>
  );
};
