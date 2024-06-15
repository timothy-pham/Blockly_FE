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
  post,
  updateData,
  deleteData,
  getToken,
} from "../../utils/dataProvider";
import { getCurrentDateTime } from "../../utils/generate";
import { saveAs } from "file-saver";
import { toastOptions } from "../../constant/toast";
import { toast } from "react-toastify";
import { ImageInput } from "../../components/input/ImageInput";
import { uploadImage } from "../../utils/firebase";

export const GroupManagement = () => {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [openPopup, setOpenPopup] = useState(false);
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [collection, setCollection] = useState([]);
  const [collectionValue, setCollectionValue] = useState();
  const [data, setData] = useState({ name: "", description: "" });
  const [type, setType] = useState("");

  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [refresh, setRefresh] = React.useState(false);
  const fileInputRef = useRef(null);

  const fetchGroup = async () => {
    try {
      const res = await fetchData("groups");
      console.log("res", res);
      if (res) {
        setRows(res);
      }
    } catch (e) {
      console.log("can not fetch groups");
    }
  };

  const fetchCollection = async () => {
    try {
      const res = await fetchData("collections");
      console.log("res", res);
      if (res) {
        setCollection(res);
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
        res = await post("groups", {
          name: dataForm.get("name"),
          meta_data: {
            description: dataForm.get("description"),
            image: imageUrl,
          },
        });
      } else {
        res = await updateData("groups", data.group_id, {
          name: dataForm.get("name"),
          collection_id: dataForm.get("collection_id"),
          meta_data: {
            description: dataForm.get("description"),
            timer: Number(dataForm.get("timer")),
            image: !preview.includes("blob") ? preview : imageUrl,
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
        `Có lỗi trong lúc ${!data?.group_id ? "thêm mới" : "chỉnh sửa"
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
      const res = await deleteData("groups", data.collection_id);
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
      await post("groups/import", file);
    } catch (err) {
      console.log("can not create block");
    } finally {
      setRefresh(!refresh);
    }
  };

  const handleExport = async (url) => {
    fetch(`${process.env.REACT_APP_API_URL}/groups/export`, {
      headers: {
        Authorization: getToken(),
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.blob())
      .then((blob) => {
        var _url = window.URL.createObjectURL(blob);
        saveAs(_url, `groupData-${getCurrentDateTime()}.json`);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      <TableContainer sx={{ padding: 3 }} component={Paper}>
        <div className="flex justify-between">
          <Typography variant="h6">Quản lí bài tập</Typography>
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
              <TableCell>Thời gian</TableCell>
              <TableCell>Hình ảnh</TableCell>
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
                <TableCell>{row?.meta_data?.description}</TableCell>
                <TableCell>{row?.collection?.name}</TableCell>
                <TableCell>
                  {row?.meta_data?.timer ? `${row?.meta_data?.timer} phút` : ""}
                </TableCell>
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
          setPreview(null);
          setSelectedImage(null);
          setData({});
          setOpenPopup(false);
        }}
      >
        {!data.group_id ? `Tạo bài tập` : `Chỉnh sửa bài tập ${data.name}`}
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
          {data?.group_id && (
            <Select
              native
              fullWidth
              // value={data?.type}
              onChange={(e) => {
                if (e.target.value) {
                  setType(
                    collection.find((v) => v.collection_id == e.target.value)
                      ?.type
                  );
                }
              }}
              inputProps={{
                name: "collection_id",
                id: "collection_id",
              }}
              defaultValue={data?.collection?.collection_id}
            >
              <option value={""}></option>

              {collection.map((row) => (
                <option value={row.collection_id}>{row.name}</option>
              ))}
            </Select>
          )}
          {(type === "multiplayer" ||
            collection.find(
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
            defaultValue={data.meta_data?.description}
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
