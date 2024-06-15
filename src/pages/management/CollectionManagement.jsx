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
  Select,
} from "@mui/material";
import TablePaginationActions from "@mui/material/TablePagination/TablePaginationActions";
import React, { useEffect, useRef, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import {
  fetchData,
  apiPost,
  updateData,
  deleteData,
  getToken,
} from "../../utils/dataProvider";
import { getCurrentDateTime } from "../../utils/generate";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import { toastOptions } from "../../constant/toast";
import { ImageInput } from "../../components/input/ImageInput";
import { uploadImage } from "../../utils/firebase";

const types = [
  { value: "solo", label: "Thi đấu trực tuyến" },
  { value: "normal", label: "Luyện tập" },
];

const COLLECTION_TYPE = {
  solo: "Thi đấu trực tuyến",
  normal: "Luyện tập",
  multiplayer: "Nhiều người chơi",
};

export const CollectionManagement = () => {
  const navigate = useNavigate();
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

  const fetchCollection = async () => {
    try {
      const res = await fetchData("collections");
      console.log("res", res);
      if (res) {
        setRows(res);
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
        res = await updateData("collections", data.collection_id, {
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
      const res = await deleteData("collections", data.collection_id);
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
          await handleImport(JSON.parse(e.target.result));
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
      await apiPost("collections/import", file);
    } catch (err) {
      console.log("can not create block");
    } finally {
      setRefresh(!refresh);
    }
  };

  const handleExport = async (url) => {
    fetch(`${process.env.REACT_APP_API_URL}/collections/export`, {
      headers: {
        Authorization: getToken(),
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.blob())
      .then((blob) => {
        var _url = window.URL.createObjectURL(blob);
        saveAs(_url, `collectionData-${getCurrentDateTime()}.json`);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      <TableContainer sx={{ padding: 3 }} component={Paper}>
        <div className="flex justify-between">
          <Typography variant="h6">Quản lí danh mục</Typography>
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
                Nhập JSON
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
              Xuất Json
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
              <TableCell>Tên</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell>Thể loại</TableCell>
              <TableCell>Hình ảnh </TableCell>
              <TableCell>Action</TableCell>
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
            defaultValue={data.name}
            autoFocus
          />
          <TextField
            margin="normal"
            fullWidth
            name="description"
            label="Mô tả"
            defaultValue={data.meta_data?.description}
            id="description"
            multiline
            rows={4}
          />
          <Select
            native
            fullWidth
            inputProps={{
              name: "type",
              id: "type",
            }}
            defaultValue={data.type || "normal"}
          >
            {types.map((row) => (
              <option value={row.value}>{row.label}</option>
            ))}
          </Select>
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
