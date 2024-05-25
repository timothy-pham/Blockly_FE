import { Typography, Button, Select } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from "@mui/material";
import { useEffect, useState } from "react";
import { createData, fetchData } from "../../utils/dataProvider";

export const Rooms = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [dialogCreateRoom, setDialogCreateRoom] = useState(false);
    const [collections, setCollections] = useState([]);
    const [groups, setGroups] = useState([]);
    const [createRoom, setCreateRoom] = useState({});

    const fetchCollection = async () => {
        try {
            const res = await fetchData("collections");
            if (res) {
                setCollections(res);
            }
        } catch (e) {
            console.log("can not fetch collection");
        }
    };

    const fetchGroup = async (collection_id) => {
        try {
            const res = await fetchData("groups/search?collection_id=" + collection_id);
            if (res) {
                setGroups(res);
            }
        } catch (e) {
            console.log("can not fetch collection");
        }
    }

    useEffect(() => {
        fetchCollection();
    }, []);

    const handleCreateRoom = async () => {

        try {
            let data = {
                name: createRoom.name,
                description: createRoom.description,
                meta_data: {
                    collection_id: createRoom.collection_id,
                    group_id: createRoom.group_id
                }
            }
            const res = await createData("rooms", data);
            if (res) {
                setDialogCreateRoom(false);
                setCreateRoom({});
                navigate("/rooms/" + res.room_id);
            }
        } catch (error) {
            console.log("can not create room");
            alert("can not create room");
        }
    }
    return (
        <>
            {/* header */}
            <div className="flex justify-between items-center mb-5">
                <div className="flex items-center">
                    <Typography variant="h6">Phòng</Typography>
                </div>
                <div className="flex items-center">
                    <Button
                        sx={{ mr: 2 }}
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            // refresh page
                        }}
                    >
                        Làm mới
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            setDialogCreateRoom(true);
                        }}
                    >
                        Tạo phòng
                    </Button>
                </div>
            </div>
            {/* table content*/}
            <div>
                <table className="table-auto w-full">
                    <thead>
                        <tr>
                            <th className="border px-4 py-2">Tên phòng</th>
                            <th className="border px-4 py-2">Mô tả</th>
                            <th className="border px-4 py-2">Loại</th>
                            <th className="border px-4 py-2">Chủ đề</th>
                            <th className="border px-4 py-2">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border px-4 py-2">Phòng 1</td>
                            <td className="border px-4 py-2">Mô tả phòng 1</td>
                            <td className="border px-4 py-2">Loại 1</td>
                            <td className="border px-4 py-2">Chủ đề 1</td>
                            <td className="border px-4 py-2">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => {
                                        navigate("/rooms/1/edit");
                                    }}
                                >
                                    Sửa
                                </Button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            {/* dialog create room */}
            <div>
                <Dialog
                    open={dialogCreateRoom}
                    onClose={() => {
                        setDialogCreateRoom(false);
                    }}
                >
                    <DialogTitle>Tạo phòng</DialogTitle>
                    <DialogContent>
                        <div className="mb-5 mt-3">
                            <TextField
                                label="Tên phòng"
                                variant="outlined"
                                fullWidth
                                value={createRoom.name || ""}
                                onChange={(e) => {
                                    setCreateRoom({ ...createRoom, name: e.target.value });
                                }}
                            />
                        </div>
                        <div className="mb-5">
                            <TextField
                                multiline
                                rows={4}
                                label="Mô tả"
                                variant="outlined"
                                fullWidth
                                value={createRoom.description || ""}
                                onChange={(e) => {
                                    setCreateRoom({ ...createRoom, description: e.target.value });
                                }}
                            />
                        </div>
                        <div className="mb-5">
                            <Select
                                fullWidth
                                defaultValue={collections[0]?.collection_id || ""}
                                value={createRoom.collection_id || ""}
                                onChange={(e) => {
                                    setCreateRoom({ ...createRoom, collection_id: e.target.value });
                                    fetchGroup(e.target.value);
                                }}
                            >
                                {collections.map((collection) => {
                                    return (
                                        <MenuItem key={collection.collection_id} value={collection.collection_id}>
                                            {collection.name}
                                        </MenuItem>
                                    )
                                })}
                            </Select>
                        </div>
                        <div className="mb-5">
                            <Select
                                fullWidth
                                defaultValue={groups[0]?.group_id || ""}
                                value={createRoom.group_id || ""}
                                onChange={(e) => {
                                    setCreateRoom({ ...createRoom, group_id: e.target.value });
                                }}
                            >
                                {groups.map((group) => {
                                    return (
                                        <MenuItem key={group.group_id} value={group.group_id}>
                                            {group.name}
                                        </MenuItem>
                                    )
                                })}
                            </Select>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                handleCreateRoom();
                            }}
                        >
                            Tạo
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </>
    )
}