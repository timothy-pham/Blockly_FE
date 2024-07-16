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
import React, { useEffect, useState, useRef, useCallback } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import {
  apiGet,
  apiPost,
  apiPatch,
  apiDelete,
  getToken,
} from "../../utils/dataProvider";
import moment from "moment";
import { saveAs } from "file-saver";
import { getCurrentDateTime } from "../../utils/generate";
import { toast } from "react-toastify";
import { toastOptions } from "../../constant/toast";
import { getColor, getLabel } from "../../utils/levelParse";

const orderByOptions = [
  { value: "name", label: "Tên" },
  { value: "level", label: "Độ khó" },
  { value: "timestamp", label: "Ngày tạo" },
  { value: "updated_at", label: "Lần sửa cuối" },
];
const sortOptions = [
  { value: "asc", label: "Tăng dần" },
  { value: "desc", label: "Giảm dần" },
];

export const BlockManagement = () => {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [data, setData] = useState({ name: "", description: "" });
  const [temp, setTemp] = useState([]);
  const [collections, setCollections] = useState([]);
  const [collection, setCollection] = useState(null);
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [group, setGroup] = useState(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState(sortOptions[0]);
  const [orderBy, setOrderBy] = useState(orderByOptions[0]);

  const [refresh, setRefresh] = React.useState(false);

  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const fetchBlocks = async () => {
    try {
      const res = await apiGet("blocks");
      if (res) {
        sortBlocks(res);
        setTemp(res);
      }
    } catch (e) {
      console.log("can not fetch groups");
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await apiGet("groups");
      if (res) {
        setGroups(res);
        setFilteredGroups(res);
      }
    } catch (e) {
      console.log("can not fetch groups");
    }
  };

  const fetchCollections = async () => {
    try {
      const res = await apiGet("collections");
      if (res) {
        setCollections(res);
      }
    } catch (e) {
      console.log("can not fetch collections");
    }
  };

  const sortBlocks = (data) => {
    const sortedBlocks = data.sort((a, b) => {
      return new Date(a.created_at) - new Date(b.created_at);
    });
    setRows(sortedBlocks);
  };

  useEffect(() => {
    fetchBlocks();
    fetchGroups();
    fetchCollections();
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
      const res = await apiDelete("blocks", data.block_id);
      if (res) {
        toast.success("Xóa câu hỏi thành công.", toastOptions);
      }
    } catch (err) {
      toast.error(
        "Có lỗi trong lúc xóa câu hỏi. Vui lòng kiểm tra lại.",
        toastOptions
      );
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
          await handleImport(e.target.result);
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
      await apiPost("blocks/import", {
        data: file
      });
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
        saveAs(_url, `blockData-${getCurrentDateTime()}.txt`);
        // window.open(_url, "_blank").focus(); // window.open + focus
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleNameFilterChange = (e) => {
    if (e.target.value === "") {
      setSearch("");
      return;
    }
    const name = e.target.value;
    setSearch(name);
  };

  const handleGroupFilterChange = (e, value) => {
    if (value === null) {
      setGroup(null);
      return;
    }
    const group = value;
    setGroup(group);
  };

  const handleCollectionFilterChange = (e, value) => {
    if (value === null) {
      setCollection(null);
      return;
    }
    const collection = value;
    setCollection(collection);
  };

  useEffect(() => {
    const applyFiltersAndSort = () => {
      let filteredRows = temp;
      if (collection) {
        filteredRows = filteredRows.filter((row) => {
          return (
            row?.group?.collection?.collection_id === collection.collection_id
          );
        });
        let filteredGroups = groups.filter((group) => {
          return group?.collection?.collection_id === collection.collection_id;
        });
        if (
          group &&
          !filteredGroups.find((g) => g.group_id === group.group_id)
        ) {
          setGroup(null);
        }
        setFilteredGroups(filteredGroups);
      } else {
        setFilteredGroups(groups);
      }
      if (group) {
        filteredRows = filteredRows.filter((row) => {
          return row?.group?.group_id === group.group_id;
        });
      }
      if (search) {
        filteredRows = filteredRows.filter((row) => {
          return (
            row.question.toLowerCase().includes(search.toLowerCase()) ||
            row.name.toLowerCase().includes(search.toLowerCase())
          );
        });
      }

      if (orderBy) {
        if (orderBy.value === "updated_at") {
          filteredRows = filteredRows.sort((a, b) => {
            const dateA = new Date(a.updated_at);
            const dateB = new Date(b.updated_at);

            // Chuyển đổi thời gian về múi giờ +07:00
            dateA.setHours(dateA.getHours() + 7);
            dateB.setHours(dateB.getHours() + 7);

            if (sort.value === "asc") {
              return dateA - dateB;
            } else {
              return dateB - dateA;
            }
          });
        } else {
          filteredRows = filteredRows.sort((a, b) => {
            if (sort.value === "asc") {
              return a[orderBy.value] > b[orderBy.value] ? 1 : -1;
            } else {
              return a[orderBy.value] < b[orderBy.value] ? 1 : -1;
            }
          });
        }
      }
      setRows([...filteredRows]); // Make sure to create a new array to force a re-render
    };

    applyFiltersAndSort();
  }, [collection, group, search, sort, orderBy, temp, groups]);

  return (
    <>
      <Paper sx={{ padding: 3, marginBottom: 5, display: "flex", gap: 3 }}>
        {collections.length > 0 && (
          <Autocomplete
            value={collection}
            options={collections}
            getOptionLabel={(option) => option.name}
            style={{ width: 300 }}
            onChange={handleCollectionFilterChange}
            renderInput={(params) => <TextField {...params} label="Danh mục" />}
          />
        )}
        {groups.length > 0 && (
          <Autocomplete
            value={group}
            options={filteredGroups}
            getOptionLabel={(option) => option.name}
            style={{ width: 300 }}
            onChange={handleGroupFilterChange}
            renderInput={(params) => <TextField {...params} label="Nhóm" />}
          />
        )}
        <TextField label="Tìm theo câu hỏi" onChange={handleNameFilterChange} />
        {/* sắp xếp */}
        <Autocomplete
          value={orderBy}
          options={orderByOptions}
          getOptionLabel={(option) => option.label}
          style={{ width: 200 }}
          onChange={(e, value) => setOrderBy(value)}
          renderInput={(params) => (
            <TextField {...params} label="Sắp xếp theo" />
          )}
          disableClearable
        />
        <Autocomplete
          value={sort}
          options={sortOptions}
          getOptionLabel={(option) => option.label}
          style={{ width: 200 }}
          onChange={(e, value) => setSort(value)}
          renderInput={(params) => <TextField {...params} label="Thứ tự" />}
          disableClearable
        />
      </Paper>
      <TableContainer sx={{ padding: 3 }} component={Paper}>
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
                Nhập dữ liệu
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
              Xuất dữ liệu
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
              <TableCell>Hình ảnh</TableCell>
              <TableCell>Vị trí</TableCell>
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
                <TableCell>{row?.question}</TableCell>
                <TableCell>{row?.group.name}</TableCell>
                <TableCell>
                  <Chip
                    label={getLabel(row?.level)}
                    style={{
                      backgroundColor: getColor(row?.level),
                      color: "black",
                      fontWeight: "bold",
                    }}
                    sx={{ width: "fit-content" }}
                  />
                </TableCell>
                <TableCell>
                  <img
                    src={row?.meta_data?.image || "/noImage.jpg"}
                    height={100}
                    width={100}
                    alt=""
                  />
                </TableCell>
                <TableCell>{row?.meta_data?.position}</TableCell>
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
