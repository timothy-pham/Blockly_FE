import { Typography, Button, Select, Paper } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from "@mui/material";
import { useEffect, useState } from "react";
import { apiPost, apiGet } from "../../utils/dataProvider";

export const Rooms = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [dialogCreateRoom, setDialogCreateRoom] = useState(false);
  const [collections, setCollections] = useState([]);
  const [groups, setGroups] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [createRoom, setCreateRoom] = useState({});

  const fetchRoom = async () => {
    try {
      const res = await apiGet("rooms");
      if (res) {
        setRooms(res);
      }
    } catch (e) {
      console.log("can not fetch room");
    }
  };

  const fetchCollection = async () => {
    try {
      const res = await apiGet("collections");
      if (res) {
        const temp = res.filter((collection) => collection.type !== "normal");
        setCollections(temp);
        setCreateRoom({ ...createRoom, collection_id: temp[0].collection_id });
        fetchGroup(temp[0].collection_id);
      }
    } catch (e) {
      console.log("can not fetch collection");
    }
  };

  const fetchGroup = async (collection_id) => {
    try {
      const res = await apiGet(
        "groups/search?collection_id=" + collection_id
      );
      if (res) {
        setGroups(res);
        setCreateRoom({ ...createRoom, group_id: res[0].group_id });
      }
    } catch (e) {
      console.log("can not fetch collection");
    }
  };

  useEffect(() => {
    fetchRoom();
    fetchCollection();
  }, []);

  const handleCreateRoom = async () => {
    try {
      let data = {
        name: createRoom.name,
        description: createRoom.description,
        meta_data: {
          collection_id: createRoom.collection_id,
          group_id: createRoom.group_id,
        },
      };
      const res = await apiPost("rooms", data);
      if (res) {
        setDialogCreateRoom(false);
        setCreateRoom({});
        navigate("/rooms/" + res.room_id);
      }
    } catch (error) {
      console.log("can not create room");
      alert("can not create room");
    }
  };
  return (
    <Paper
      sx={{
        padding: 3,
        height: "100%",
        backgroundColor: "#f5f5f5",
        borderRadius: "20px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333333" }}>
          Phòng
        </Typography>
        <div className="flex items-center">
          <Button
            sx={{ mr: 2, fontWeight: "bold" }}
            variant="contained"
            color="primary"
            onClick={fetchRoom}
          >
            Làm mới
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setDialogCreateRoom(true)}
          >
            Tạo phòng
          </Button>
        </div>
      </div>
      {/* Table content */}
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
            {rooms.map((room) => (
              <tr key={room.room_id}>
                <td className="border px-4 py-2">{room.name}</td>
                <td className="border px-4 py-2">{room.description}</td>
                <td className="border px-4 py-2">{room.type}</td>
                <td className="border px-4 py-2">
                  {room.meta_data.collection_id}
                </td>
                <td className="border px-4 py-2">
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ fontWeight: "bold" }}
                    onClick={() => navigate("/rooms/" + room.room_id)}
                  >
                    Tham gia
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Dialog create room */}
      <Dialog
        open={dialogCreateRoom}
        fullWidth
        onClose={() => setDialogCreateRoom(false)}
      >
        <DialogTitle
          sx={{
            backgroundColor: "#f5f5f5",
            borderBottom: "1px solid #ddd",
            color: "#333333",
            fontWeight: "bold",
          }}
        >
          Tạo phòng
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: "#f5f5f5", paddingTop: "20px" }}>
          <div className="mb-5 mt-3">
            <TextField
              label="Tên phòng"
              variant="outlined"
              fullWidth
              value={createRoom.name}
              onChange={(e) =>
                setCreateRoom({ ...createRoom, name: e.target.value })
              }
            />
          </div>
          <div className="mb-5">
            <TextField
              multiline
              rows={4}
              label="Mô tả"
              variant="outlined"
              fullWidth
              value={createRoom.description}
              onChange={(e) =>
                setCreateRoom({ ...createRoom, description: e.target.value })
              }
            />
          </div>
          <div className="mb-5">
            <Select
              fullWidth
              defaultValue={collections[0]?.collection_id || ""}
              value={createRoom.collection_id}
              onChange={(e) => {
                setCreateRoom({ ...createRoom, collection_id: e.target.value });
                fetchGroup(e.target.value);
              }}
              sx={{ fontWeight: "bold" }}
            >
              {collections.map((collection) => (
                <MenuItem
                  key={collection.collection_id}
                  value={collection.collection_id}
                >
                  {collection.name}
                </MenuItem>
              ))}
            </Select>
          </div>
          <div className="mb-5">
            <Select
              fullWidth
              defaultValue={groups[0]?.group_id || ""}
              value={createRoom.group_id}
              onChange={(e) =>
                setCreateRoom({ ...createRoom, group_id: e.target.value })
              }
              sx={{ fontWeight: "bold" }}
            >
              {groups.map((group) => (
                <MenuItem key={group.group_id} value={group.group_id}>
                  {group.name}
                </MenuItem>
              ))}
            </Select>
          </div>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: "#f5f5f5", padding: "20px" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateRoom}
            sx={{ fontWeight: "bold" }}
          >
            Tạo
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};
