import {
  Box,
  Button,
  Chip,
  Dialog,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import TablePaginationActions from "@mui/material/TablePagination/TablePaginationActions";
import React, { useEffect, useState } from "react";
import { apiGet, apiPost } from "../utils/dataProvider";
import { formatDateTime, formatTime } from "../utils/transform";
import { toastOptions } from "../constant/toast";
import { toast } from "react-toastify";

export const Support = () => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [rows, setRows] = useState([]);
  const [refresh, setRefresh] = React.useState(false);
  const info = localStorage.getItem("authToken");
  const { user } = JSON.parse(info);
  const [openPopup, setOpenPopup] = useState(false);
  const [data, setData] = useState({});

  const handleSumbit = async (e) => {
    e.preventDefault();
    var title = document.getElementById("title").value;
    var message = document.getElementById("messages").value;

    try {
      const res = await apiPost("tickets", {
        title,
        message,
      });
      if (res && res.success) {
        toast.success("Yêu cầu thành công!", toastOptions);
      }
    } catch (e) {
      toast.error(`Error: ${e.message}`, toastOptions);
    } finally {
      document.getElementById("title").value = "";
      document.getElementById("messages").value = "";
      setRefresh(!refresh);
    }
  };

  const fetchTicket = async () => {
    try {
      const res = await apiGet(`tickets/user/${user.user_id}`);
      if (res) {
        setRows(res);
      }
    } catch (e) {
      console.log("can not fetch ticket");
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    fetchTicket();
  }, [refresh]);

  const status = {
    open: {
      name: "Đang mở",
      color: "#83ec09",
    },
    responded: {
      name: "Đã trả lời",
      color: "#fc650d",
    },
    closed: {
      name: "Đã đóng",
      color: "#f70202",
    },
  };

  const getColor = (level) => {
    return status[`${level}`]?.color || "black";
  };

  const getLabel = (level) => {
    return status[`${level}`]?.name || "Không xác định";
  };

  const handleOpenMesage = (row) => {
    setOpenPopup(true);
    setData(row);
    // scroll to bottom of list-tickets smoothly
    setTimeout(() => {
      const listTickets = document.querySelector(".list-tickets");
      if (listTickets) {
        listTickets.scrollTop = listTickets.scrollHeight;
      }
    }, 500);
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    let res;
    const dataForm = new FormData(e.currentTarget);

    try {
      res = await apiPost(`tickets/request/${data.ticket_id}`, {
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
    <div className="container-body gap-3">
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
            Danh sách phiếu hỗ trợ
          </Typography>
        </div>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow className="[&>*]:font-bold">
              <TableCell
                sx={{
                  color: "var(--red)",
                }}
              >
                ID
              </TableCell>
              <TableCell>Tiêu đề</TableCell>
              <TableCell>Lần cập nhật gần nhất</TableCell>
              <TableCell>Trạng thái</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : rows
            ).map((row, index) => (
              <TableRow
                key={index}
                onClick={() => handleOpenMesage(row)}
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

      <div
        style={{
          padding: 3,
          width: "80%",
          backgroundColor: "var(--black)",
          borderRadius: "10px",
          border: "1px solid var(--red)",
          color: "var(--red)",
          paddingTop: "25px",
          "& .MuiTableCell-root": {
            color: "var(--red)",
            fontSize: "18px",
            textAlign: "start",
          },
        }}
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
            Gửi phiếu hỗ trợ
          </Typography>

          <form className="space-y-4 md:space-y-6 w-full p-20 pt-0">
            <div>
              <label
                htmlFor="title"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Tiêu đề
              </label>
              <input
                name="title"
                id="title"
                className="bg-[var(--black)] border border-[var(--red)] text-gray-900 sm:text-sm rounded-lg block w-full p-2.5  dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Tiêu đề"
              />
            </div>

            <div>
              <label
                htmlFor="messages"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Tin nhắn
              </label>
              <textarea
                name="messages"
                id="messages"
                className="bg-[var(--black)] border border-[var(--red)] text-gray-900 sm:text-sm rounded-lg block w-full p-2.5  dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Tin nhắn"
                rows={5}
              />
            </div>

            <Button
              onClick={handleSumbit}
              variant="contained"
              className="w-full text-white bg-sky-600 hover:bg-sky-700 focus:ring-4 focus:outline-none focus:ring-sky-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-sky-600 dark:hover:bg-sky-700 dark:focus:ring-sky-800"
            >
              Gửi
            </Button>
          </form>

          <div className="mt-5 text-center">HOẶC</div>
          <div>
            Email:{" "}
            <a href="mailto:phamtiendat.dev@gmail.com">
              phamtiendat.dev@gmail.com
            </a>
          </div>
          <div>
            Phone: <a href="tel:+84903684049">+84 903.684.049 Mr. Dat Pham</a>
          </div>
          <div className="mt-3">
            Email:{" "}
            <a href="mailto:thanhsonnguyen.dev@gmail.com">
              thanhsonnguyen.dev@gmail.com
            </a>
          </div>
          <div>
            Phone: <a href="tel:+84967970238">+84 967.970.238 Mr. Son Nguyen</a>
          </div>

          <div className="mt-3">
            Facebook:{" "}
            <a
              href="https://www.facebook.com/datons.blockly"
              className="underline"
            >
              Datons (Website thi đấu toán)
            </a>
          </div>
        </div>
      </div>

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
          Phiếu : {data?.title}
        </Typography>

        <div
          style={{
            height: 400,
            overflowY: "auto",
          }}
          className="list-tickets"
        >
          {data?.messages?.map((item, index) => (
            <Box
              sx={{
                width: "100%",
                mb: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: item.type === "request" ? "flex-end" : "flex-start",
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
                    item?.type === "request" ? "#FAEDCE" : "#FEFAE0",
                  whiteSpace: "pre-wrap",
                  minHeight: 48,
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
            label="Câu hỏi"
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
            Gửi câu hỏi
          </Button>
        </Box>
      </Dialog>
    </div>
  );
};
