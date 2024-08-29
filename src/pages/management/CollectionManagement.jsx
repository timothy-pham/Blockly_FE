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
  Autocomplete,
  InputLabel,
  MenuItem,
  Box,
  TextField,
  Select,
  FormControl,
  Checkbox,
} from "@mui/material";
import TablePaginationActions from "@mui/material/TablePagination/TablePaginationActions";
import React, { useEffect, useRef, useState } from "react";
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
import { getCurrentDateTime } from "../../utils/generate";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import { toastOptions } from "../../constant/toast";
import { ImageInput } from "../../components/input/ImageInput";
import { uploadImage } from "../../utils/firebase";
import { ExportExcelMenuButton } from "../../components/ExportButton";

const types = [
  { value: "solo", label: "Thi đấu trực tuyến" },
  { value: "normal", label: "Luyện tập" },
];

const COLLECTION_TYPE = {
  solo: "Thi đấu trực tuyến",
  normal: "Luyện tập",
  multiplayer: "Nhiều người chơi",
};

const orderByOptions = [
  { value: "name", label: "Tên" },
  // { value: "level", label: "Độ khó" },
  { value: "timestamp", label: "Ngày tạo" },
  { value: "updated_at", label: "Lần sửa cuối" },
];
const sortOptions = [
  { value: "asc", label: "Tăng dần" },
  { value: "desc", label: "Giảm dần" },
];

export const CollectionManagement = () => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [openPopup, setOpenPopup] = useState(false);
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [data, setData] = useState({ name: "", description: "" });
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [refresh, setRefresh] = React.useState(false);
  const [temp, setTemp] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState(sortOptions[0]);
  const [orderBy, setOrderBy] = useState(orderByOptions[0]);
  const [selected, setSelected] = useState([]);

  const fetchCollection = async () => {
    try {
      const res = await apiGet("collections");
      if (res) {
        setRows(res);
        setTemp(res);
      }
    } catch (e) {
      console.log("can not fetch collection");
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
    const dataForm = new FormData(event.currentTarget);
    let imageUrl;
    if (selectedImage) {
      imageUrl = await uploadImage(selectedImage, "collections");
    }
    try {
      if (!data?.collection_id) {
        res = await apiPost("collections", {
          type: dataForm.get("type"),
          name: dataForm.get("name"),
          meta_data: {
            description: dataForm.get("description"),
            image: imageUrl,
          },
        });
      } else {
        res = await apiPatch("collections", data.collection_id, {
          type: dataForm.get("type"),
          name: dataForm.get("name"),
          meta_data: {
            description: dataForm.get("description"),
            image: !preview.includes("blob") ? preview : imageUrl,
          },
        });
      }
      if (res) {
        toast.success(
          ` ${!data?.collection_id ? "Thêm mới" : "Chỉnh sửa"
          } danh mục thành công.`,
          toastOptions
        );
      }
      setData({});
    } catch (err) {
      toast.error(
        `Có lỗi trong lúc ${!data?.collection_id ? "thêm mới" : "chỉnh sửa"
        } danh mục. Vui lòng kiểm tra lại.`,
        toastOptions
      );
    } finally {
      setPreview(null);
      setSelectedImage(null);
      setRefresh(!refresh);
      event.target.value = "";
      setOpenPopup(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await apiDelete("collections", data.collection_id);
      if (res) {
        toast.success(`Xóa danh mục thành công.`, toastOptions);
      }
    } catch (err) {
      toast.error(
        `Có lỗi trong lúc xóa danh mục. Vui lòng kiểm tra lại.`,
        toastOptions
      );
    } finally {
      setRefresh(!refresh);
      setOpen(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
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
      await apiPost("collections/import", {
        data: file,
      });
      toast.success("Nhập dữ liệu danh mục thành công", toastOptions);
    } catch (err) {
      toast.error("Có lỗi trong lúc nhập dữ liệu", toastOptions);
    } finally {
      setRefresh(!refresh);
    }
  };

  const handleNameFilterChange = (e) => {
    const name = e.target.value;
    const filteredBlocks = temp.filter((tem) =>
      tem.name.toLowerCase().includes(name.toLowerCase())
    );
    setRows(filteredBlocks);
  };

  useEffect(() => {
    const applyFiltersAndSort = () => {
      let filteredRows = temp;

      if (search) {
        filteredRows = filteredRows.filter((row) => {
          return row.name.toLowerCase().includes(search.toLowerCase());
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
  }, [search, sort, orderBy, temp]);

  const handleExport = async (selects) => {
    fetch(`${process.env.REACT_APP_API_URL}/collections/export`, {
      method: "POST",
      headers: {
        Authorization: getToken(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids: selects, raw_data: false }),
    })
      .then((response) => response.blob())
      .then((blob) => {
        var _url = window.URL.createObjectURL(blob);
        saveAs(_url, `collectionsData-${getCurrentDateTime()}.txt`);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  //Select rows
  const isSelected = (id) => selected.indexOf(id) !== -1;
  const handleClick = (id) => {
    const newSelected = isSelected(id)
      ? selected.filter((item) => item !== id)
      : [...selected, id];
    setSelected(newSelected);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.collection_id);
      console.log("newSelected", newSelected);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const downloadMenuItems = [
    {
      label: "Xuất tất cả",
      handleClick: () => handleExport([]),
    },
    {
      label: "Xuất các dữ liệu đã chọn",
      handleClick: () => handleExport(selected),
      disabled: selected.length === 0,
    },
  ];

  return (
    <>
      <Paper sx={{ padding: 3, marginBottom: 5, display: "flex", gap: 3 }}>
        <TextField
          label="Tìm theo tên danh mục"
          onChange={handleNameFilterChange}
        />
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
          <Typography variant="h6">Quản lý danh mục</Typography>

          <div className="flex">
            <ExportExcelMenuButton items={downloadMenuItems} />
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
              startIcon={<AddIcon />}
              onClick={() => setOpenPopup(true)}
            >
              Thêm mới
            </Button>
          </div>
        </div>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow className="[&>*]:font-bold">
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  indeterminate={
                    selected.length > 0 && selected.length < rows.length
                  }
                  checked={rows.length > 0 && selected.length === rows.length}
                  onChange={handleSelectAllClick}
                  inputProps={{
                    "aria-label": "select all desserts",
                  }}
                />
              </TableCell>
              <TableCell>Tên</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell>Thể loại</TableCell>
              <TableCell>Hình ảnh </TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : rows
            ).map((row, index) => {
              const isItemSelected = isSelected(row.collection_id);
              return (
                <TableRow key={index}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={isItemSelected}
                      onClick={(event) => {
                        event.stopPropagation(); // Prevent row click event
                        handleClick(row.collection_id); // Handle checkbox click
                      }}
                    />
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {row?.name}
                  </TableCell>
                  <TableCell>{row?.meta_data?.description}</TableCell>
                  <TableCell>{COLLECTION_TYPE[row?.type]}</TableCell>
                  <TableCell>
                    <img
                      src={row?.meta_data?.image || "/noImage.jpg"}
                      height={100}
                      width={100}
                      alt=""
                    />
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
              );
            })}
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
          "& .MuiDialog-paper": { width: "80%", padding: 5, maxHeight: "80%" },
        }}
        maxWidth="md"
        open={openPopup}
        onClose={() => {
          setData({});
          setOpenPopup(false);
          setPreview(null);
          setSelectedImage(null);
        }}
      >
        {!data.collection_id
          ? `Tạo danh mục`
          : `Chỉnh sửa danh mục ${data.name}`}
        <Box
          className="flex flex-col items-center"
          component="form"
          defaultValue={data}
          onSubmit={handleSubmit}
          sx={{ mt: 1 }}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            id="Name"
            label="Tên"
            name="name"
            defaultValue={data?.name}
            autoFocus
          />
          <TextField
            margin="normal"
            fullWidth
            name="description"
            label="Mô tả"
            defaultValue={data?.meta_data?.description}
            id="description"
            multiline
            rows={4}
          />

          <TextField
            sx={{ my: 2 }}
            native
            select
            fullWidth
            inputProps={{
              name: "type",
              id: "type",
            }}
            defaultValue={data.type || "normal"}
          >
            {types.map((row, index) => (
              <MenuItem key={index} value={row.value}>{row.label}</MenuItem>
            ))}
          </TextField>

          <ImageInput
            setPreview={setPreview}
            setSelectedImage={setSelectedImage}
            preview={preview}
            defaultValue={data?.meta_data?.image}
          />
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
        }}
      >
        <span>
          Xác nhận để xóa danh mục{" "}
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
