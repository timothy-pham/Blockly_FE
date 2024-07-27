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
  MenuItem,
  Typography,
  Box,
  TextField,
  Autocomplete,
  Select,
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
import { toastOptions } from "../../constant/toast";
import { toast } from "react-toastify";
import { ImageInput } from "../../components/input/ImageInput";
import { uploadImage } from "../../utils/firebase";
import { ExportExcelMenuButton } from "../../components/ExportButton";
const orderByOptions = [
  { value: "name", label: "Tên" },
  // { value: "level", label: "Độ khó" },
  { value: "timestamp", label: "Ngày tạo" },
  { value: "updated_at", label: "Lần sửa cuối" },
  { value: "meta_data.position", label: "Vị trí" },
];
const sortOptions = [
  { value: "asc", label: "Tăng dần" },
  { value: "desc", label: "Giảm dần" },
];
export const GroupManagement = () => {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [openPopup, setOpenPopup] = useState(false);
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [collectionValue, setCollectionValue] = useState();
  const [data, setData] = useState({ name: "", description: "" });
  const [type, setType] = useState("");

  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [refresh, setRefresh] = React.useState(false);
  const fileInputRef = useRef(null);
  const [temp, setTemp] = useState([]);

  const [collections, setCollections] = useState([]);
  const [collection, setCollection] = useState(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState(sortOptions[0]);
  const [orderBy, setOrderBy] = useState(orderByOptions[0]);
  const [selected, setSelected] = useState([]);

  const fetchGroup = async () => {
    try {
      const res = await apiGet("groups");
      // console.log("res", res);
      if (res) {
        setRows(res);
        setTemp(res);
      }
    } catch (e) {
      console.log("can not fetch groups");
    }
  };

  const fetchCollection = async () => {
    try {
      const res = await apiGet("collections");
      if (res) {
        setCollectionValue(res[0].collection_id);
        setCollections(res);
      }
    } catch (e) {
      console.log("can not fetch collection");
    }
  };
  useEffect(() => {
    fetchGroup();
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
    let imageUrl;
    const dataForm = new FormData(event.currentTarget);
    if (selectedImage) {
      imageUrl = await uploadImage(selectedImage, "groups");
    }
    try {
      if (!data?.group_id) {
        res = await apiPost("groups", {
          name: dataForm.get("name"),
          collection_id: dataForm.get("collection_id"),
          meta_data: {
            description: dataForm.get("description"),
            position: dataForm.get("position"),
            image: imageUrl,
          },
        });
      } else {
        res = await apiPatch("groups", data.group_id, {
          name: dataForm.get("name"),
          collection_id: dataForm.get("collection_id"),
          meta_data: {
            description: dataForm.get("description"),
            position: dataForm.get("position"),
            timer: Number(dataForm.get("timer")),
            image: !preview?.includes("blob") ? preview : imageUrl,
          },
        });
      }
      if (res) {
        toast.success(
          ` ${!data?.group_id ? "Thêm mới" : "Chỉnh sửa"} bài tập thành công.`,
          toastOptions
        );
      }
      setData({});
    } catch (err) {
      toast.error(
        `Có lỗi trong lúc ${
          !data?.group_id ? "thêm mới" : "chỉnh sửa"
        } bài tập. Vui lòng kiểm tra lại.`,
        toastOptions
      );
    } finally {
      event.target.value = "";
      setRefresh(!refresh);
      setPreview(null);
      setSelectedImage(null);
      setOpenPopup(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await apiDelete("groups", data.group_id);
      if (res) {
        toast.success(`Xóa bài tập thành công.`, toastOptions);
      }
    } catch (err) {
      toast.error(
        `Có lỗi trong lúc xóa bài tập. Vui lòng kiểm tra lại.`,
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
      await apiPost("groups/import", {
        data: file,
      });
    } catch (err) {
      console.log("can not create block");
    } finally {
      setRefresh(!refresh);
    }
  };

  const handleNameFilterChange = (e) => {
    if (e.target.value === "") {
      setSearch("");
      return;
    }
    const name = e.target.value;
    setSearch(name);
  };

  const handleCollectionFilterChange = (e, value) => {
    if (value === null) {
      setCollection(null);
      return;
    }
    const collection = value;
    setCollection(collection);
  };

  const getNestedValue = (obj, path) => {
    return (
      path.includes(".") &&
      path.split(".").reduce((acc, part) => acc && acc[part], obj)
    );
  };

  useEffect(() => {
    const applyFiltersAndSort = () => {
      let filteredRows = temp;
      if (collection) {
        filteredRows = filteredRows.filter((row) => {
          return row?.collection?.collection_id === collection.collection_id;
        });
      }

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
            const aValue = getNestedValue(a, orderBy.value);
            const bValue = getNestedValue(b, orderBy.value);

            if (aValue === undefined) return 1;
            if (bValue === undefined) return -1;

            if (sort.value === "asc") {
              return aValue > bValue ? 1 : -1;
            } else {
              return aValue < bValue ? 1 : -1;
            }
          });
        }
      }
      setRows([...filteredRows]); // Make sure to create a new array to force a re-render
    };

    applyFiltersAndSort();
  }, [collection, search, sort, orderBy, temp]);

  const handleExport = async (selects) => {
    fetch(`${process.env.REACT_APP_API_URL}/groups/export`, {
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
        saveAs(_url, `groupsData-${getCurrentDateTime()}.txt`);
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
      const newSelected = rows.map((n) => n.group_id);
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
        <TextField
          label="Tìm theo tên bài tập"
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
          <Typography variant="h6">Quản lí bài tập</Typography>

          <div className="flex">
            <ExportExcelMenuButton items={downloadMenuItems} />

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
              <TableCell>Thời gian</TableCell>
              <TableCell>Hình ảnh</TableCell>
              <TableCell>Vị trí</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : rows
            ).map((row, index) => {
              const isItemSelected = isSelected(row.group_id);
              return (
                <TableRow key={index}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={isItemSelected}
                      onClick={(event) => {
                        event.stopPropagation(); // Prevent row click event
                        handleClick(row.group_id); // Handle checkbox click
                      }}
                    />
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {row?.name}
                  </TableCell>
                  <TableCell>{row?.meta_data?.description}</TableCell>
                  <TableCell>{row?.collection?.name}</TableCell>
                  <TableCell>
                    {row?.meta_data?.timer
                      ? `${row?.meta_data?.timer} phút`
                      : ""}
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
                      onClick={() => {
                        setOpenPopup(true);
                        setCollectionValue(row?.collection_id);
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
          setPreview(null);
          setSelectedImage(null);
          setData({});
          setOpenPopup(false);
        }}
      >
        {!data.group_id ? `Tạo bài tập` : `Chỉnh sửa bài tập`}
        <Box
          className="flex flex-col items-center"
          component="form"
          // defaultValue={data}
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
            defaultValue={data.name}
            autoFocus
          />
          <TextField
            margin="normal"
            fullWidth
            id="position"
            label="Vị trí"
            name="position"
            defaultValue={data?.meta_data?.position}
            autoFocus
          />
          <TextField
            sx={{ my: 2 }}
            select
            native
            label="Danh mục"
            fullWidth
            // value={data?.type}
            onChange={(e) => {
              if (e.target.value) {
                setType(
                  collections.find((v) => v.collection_id == e.target.value)
                    ?.type
                );
              }
            }}
            inputProps={{
              name: "collection_id",
              id: "collection_id",
            }}
            defaultValue={data?.collection?.collection_id || collectionValue}
          >
            {collections.map((row) => (
              <MenuItem key={row.collection_id} value={row.collection_id}>
                {row.name}
              </MenuItem>
            ))}
          </TextField>
          {(type === "multiplayer" ||
            collections.find(
              (v) => v.collection_id == data?.collection?.collection_id
            )?.type === "multiplayer") && (
            <TextField
              margin="normal"
              type="number"
              required
              fullWidth
              id="timer"
              label="Thời gian"
              placeholder="Số phút"
              name="timer"
              defaultValue={data?.meta_data?.timer}
              autoFocus
            />
          )}
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
          Xác nhận để xóa Groups{" "}
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
