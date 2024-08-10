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
    Chip
} from "@mui/material";
import TablePaginationActions from "@mui/material/TablePagination/TablePaginationActions";
import React, { useEffect, useRef, useState } from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
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
import { getRoomColor, getRoomStatus } from "../../utils/roomParse";
import { truncateText } from "../../utils/transform";

const types = [
    { value: "solo", label: "Thi đấu trực tuyến" },
    { value: "normal", label: "Luyện tập" },
];

const ROOM_TYPE = {
    solo: "Thi đấu trực tuyến",
    normal: "Luyện tập",
    multiplayer: "Nhiều người chơi",
};

const orderByOptions = [
    { value: "room_id", label: "Ngày tạo" },
    { value: "name", label: "Tên" },
    { value: "status", label: "Trạng thái" },
    { value: "updated_at", label: "Lần sửa cuối" },
];
const sortOptions = [
    { value: "desc", label: "Giảm dần" },
    { value: "asc", label: "Tăng dần" },
];

export const RoomManagement = () => {
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

    const fetchRoom = async () => {
        try {
            const res = await apiGet("rooms?all=true");
            if (res) {
                setRows(res);
                setTemp(res);
            }
        } catch (e) {
            console.log("can not fetch room");
        }
    };
    useEffect(() => {
        fetchRoom();
    }, [refresh]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSubmit = async () => {
        try {
            const res = await apiPost("rooms/mark-finished", {
                ids: selected
            })
            if (res) {
                toast.success(`Xóa phòng thành công.`, toastOptions);
            }
        } catch (err) {
            toast.error(
                `Có lỗi trong lúc xóa phòng. Vui lòng kiểm tra lại.`,
                toastOptions
            );
        } finally {
            setRefresh(!refresh);
            setOpen(false);
            setData({})
        }
    };

    const handleDelete = async () => {
        try {
            const res = await apiPost("rooms/mark-finished", {
                ids: [
                    data.room_id
                ]
            })
            if (res) {
                toast.success(`Xóa phòng thành công.`, toastOptions);
            }
        } catch (err) {
            toast.error(
                `Có lỗi trong lúc xóa phòng. Vui lòng kiểm tra lại.`,
                toastOptions
            );
        } finally {
            setRefresh(!refresh);
            setOpen(false);
            setData({})
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
            const newSelected = rows.map((n) => n.room_id);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };


    return (
        <>
            <Paper sx={{ padding: 3, marginBottom: 5, display: "flex", gap: 3 }}>
                <TextField
                    label="Tìm theo tên phòng"
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
                    <Typography variant="h6">Quản lí phòng</Typography>
                    <div className="flex">
                        {selected?.length > 0 && <Button
                            color="primary"
                            variant="contained"
                            size="small"
                            component="a"
                            endIcon={<CheckCircleIcon />}
                            onClick={() => setOpenPopup(true)}
                        >
                            Đánh dấu kết thúc các phòng đã chọn
                        </Button>}
                    </div>
                </div>

                <Table aria-label="simple table">
                    <TableHead>
                        <TableRow className="[&>*]:font-bold">
                            <TableCell padding="checkbox">
                                <Checkbox
                                    color="primary"
                                    indeterminate={
                                        selected?.length > 0 && selected?.length < rows.length
                                    }
                                    checked={rows.length > 0 && selected?.length === rows.length}
                                    onChange={handleSelectAllClick}
                                    inputProps={{
                                        "aria-label": "select all desserts",
                                    }}
                                />
                            </TableCell>
                            <TableCell>STT</TableCell>
                            <TableCell>Chủ phòng</TableCell>
                            <TableCell>Tên phòng</TableCell>
                            <TableCell>Đề tài</TableCell>
                            <TableCell>Mô tả</TableCell>
                            <TableCell style={{
                                textAlign: "center",
                            }}>Trạng thái</TableCell>
                            <TableCell style={{
                                textAlign: "center",
                            }}>Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(rowsPerPage > 0
                            ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            : rows
                        ).map((row, index) => {
                            const isItemSelected = isSelected(row.room_id);
                            const host = row?.users?.find((user) => user?.is_host === true);
                            return (
                                <TableRow key={index}>

                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            color="primary"
                                            checked={isItemSelected}
                                            onClick={(event) => {
                                                event.stopPropagation(); // Prevent row click event
                                                handleClick(row.room_id); // Handle checkbox click
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {row?.room_id}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center ">
                                            <img
                                                src={host?.user_data?.meta_data?.avatar || "/default_avatar.png"}
                                                className="w-10 h-10 rounded-full  object-cover mr-2"
                                            />
                                            <p style={{
                                                whiteSpace: "nowrap",
                                            }}>{host?.user_data?.name}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>{truncateText(row?.name, 10)}</TableCell>
                                    <TableCell>{row?.meta_data?.group_data?.name}</TableCell>
                                    <TableCell>{truncateText(row?.description, 10)}</TableCell>
                                    <TableCell style={{
                                        textAlign: "center",
                                    }}>
                                        <Chip
                                            label={getRoomStatus(row.status)}
                                            style={{
                                                margin: 2,
                                                backgroundColor: getRoomColor(row.status),
                                                fontWeight: "bold",
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell
                                        style={{
                                            textAlign: "center",
                                        }}
                                    >
                                        <IconButton
                                            onClick={() => {
                                                setData(row);
                                                setOpen(true);
                                            }}
                                        >
                                            <CheckCircleIcon />
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
                }}
            >
                <p className="text-center">
                    Bạn chắc chắn muốn đánh dấu {selected?.length} phòng đã chọn là kết thúc chứ?
                </p>
                <Box
                    className="flex justify-center"
                    component="form"
                    defaultValue={data}
                    onSubmit={handleSubmit}
                    sx={{ mt: 1 }}
                >
                    <Button
                        color="error"
                        onClick={() => {
                            setData({});
                            setOpenPopup(false);
                        }}
                        variant="contained" sx={{ mt: 3, mr: 2 }}>
                        Hủy
                    </Button>
                    <Button type="submit" variant="contained" sx={{ mt: 3 }}>
                        Xác nhận
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
                    Đánh dấu phòng
                    <span style={{ color: "red" }}> {data.room_id} </span>
                    là kết thúc ngay?
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
