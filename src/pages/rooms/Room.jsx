import { Typography, Button, Select, Paper } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
} from "@mui/material";
import { useEffect, useState } from "react";
import { apiPost, apiGet } from "../../utils/dataProvider";
import { getRoomColor, getRoomStatus } from "../../utils/roomParse";
import { socket } from "../../socket";
export const Rooms = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [dialogCreateRoom, setDialogCreateRoom] = useState(false);
  const [collections, setCollections] = useState([]);
  const [groups, setGroups] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [createRoom, setCreateRoom] = useState({});
  const [validateCount, setValidateCount] = useState("");

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
      const res = await apiGet("groups/search?collection_id=" + collection_id);
      if (res) {
        // sort by meta_data.position
        const temp = res.sort(
          (a, b) => a.meta_data.position - b.meta_data.position
        );
        setGroups(temp);
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

  useEffect(() => {
    socket.on("refresh_rooms", () => {
      fetchRoom();
    });

    return () => {
      socket.off("refresh_rooms");
    };
  }, [socket]);

  const handleCreateRoom = async () => {
    try {
      const group_data = groups.find(
        (group) => group.group_id === createRoom?.group_id
      );
      let data = {
        name: createRoom?.name,
        description: createRoom?.description,
        meta_data: {
          collection_id: createRoom?.collection_id,
          group_id: createRoom?.group_id,
          count: Number(createRoom?.count),
          group_data: group_data,
        },
      };
      const res = await apiPost("rooms", data);
      if (res) {
        setDialogCreateRoom(false);
        setCreateRoom({});
        navigate("/rooms/" + res?.room_id);
      }
    } catch (error) {
      console.log("can not create room");
      alert("can not create room");
    }
  };

  return (
    <div class="container-body">
      <div style={{
        position: "fixed",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        zIndex: "0",
      }}>
        <div class="stripe">
          <div class="stripe_inner">
            DATONS 2024
          </div>
        </div>
      </div>
      <div
        class="glassmorph"
        style={{
          width: "80%",
          padding: "20px",
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "var(--black)" }}>
            Danh sách phòng
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
              sx={{ fontWeight: "bold" }}
              variant="contained"
              color="primary"
              onClick={() => setDialogCreateRoom(true)}
            >
              Tạo phòng
            </Button>
          </div>
        </div>
        {/* Table content */}
        <div class="room-table">
          <table className="table-auto w-full" >
            <thead>
              <tr>
                <th >Chủ phòng</th>
                <th >Tên phòng</th>
                <th >Mô tả</th>
                <th >Trạng thái</th>
                <th >Hành động</th>
              </tr>
            </thead>
            <tbody >
              {rooms.map((room, index) => {
                const host = room?.users?.find((user) => user?.is_host === true);
                return (
                  <tr key={index}>
                    <td >
                      <div className="flex items-center ">
                        <img
                          src={host?.user_data?.meta_data?.avatar}
                          className="w-10 h-10 rounded-full  object-cover mr-2"
                        />
                        <p
                          style={{
                            whiteSpace: "nowrap",
                          }}
                        >
                          {host?.user_data?.name}
                        </p>
                      </div>
                    </td>
                    <td >{room?.name}</td>
                    <td >{room?.description}</td>
                    <td className="text-center">
                      <Chip
                        label={getRoomStatus(room.status)}
                        style={{
                          margin: 2,
                          backgroundColor: getRoomColor(room.status),
                          fontWeight: "bold",
                        }}
                      />
                    </td>
                    <td className=" px-2 py-2  text-center">
                      {room.status === "waiting" ? (
                        <Button
                          variant="contained"
                          color="primary"
                          sx={{ fontWeight: "bold" }}
                          onClick={() => navigate("/rooms/" + room.room_id)}
                        >
                          Tham gia
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          color="primary"
                          sx={{ fontWeight: "bold" }}
                          onClick={() =>
                            navigate("/rooms/" + room.room_id + "/watch")
                          }
                        >
                          Theo dõi trận đấu
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
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
                value={createRoom?.name}
                onChange={(e) =>
                  setCreateRoom({ ...createRoom, name: e.target.value })
                }
              />
            </div>
            <div className="mb-5 mt-3">
              <TextField
                label="Số câu hỏi"
                type="number"
                variant="outlined"
                fullWidth
                value={createRoom?.count}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    setCreateRoom({
                      ...createRoom,
                      count: value,
                    });
                    setValidateCount("");
                  } else {
                    const numericValue = Number(value);
                    if (numericValue >= 3 && numericValue <= 10) {
                      setCreateRoom({
                        ...createRoom,
                        count: numericValue,
                      });
                      setValidateCount("");
                    } else {
                      setCreateRoom({
                        ...createRoom,
                        count: numericValue,
                      });
                      setValidateCount("Số câu hỏi phải trong khoảng 3 đến 10");
                    }
                  }
                }}
                inputProps={{ min: 3, max: 10 }}
                helperText={
                  <Typography color="error">{validateCount}</Typography>
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
                value={createRoom?.description}
                onChange={(e) =>
                  setCreateRoom({ ...createRoom, description: e.target.value })
                }
              />
            </div>
            <div className="mb-5">
              <Select
                fullWidth
                defaultValue={collections[0]?.collection_id || ""}
                value={createRoom?.collection_id}
                onChange={(e) => {
                  setCreateRoom({ ...createRoom, collection_id: e.target.value });
                  fetchGroup(e.target.value);
                }}
                sx={{ fontWeight: "bold" }}
              >
                {collections?.map((collection) => (
                  <MenuItem
                    key={collection?.collection_id}
                    value={collection?.collection_id}
                  >
                    {collection?.name}
                  </MenuItem>
                ))}
              </Select>
            </div>
            <div className="mb-5">
              <Select
                fullWidth
                defaultValue={groups[0]?.group_id || ""}
                value={createRoom?.group_id}
                onChange={(e) =>
                  setCreateRoom({ ...createRoom, group_id: e.target.value })
                }
                sx={{ fontWeight: "bold" }}
              >
                {groups?.map((group) => (
                  <MenuItem key={group?.group_id} value={group?.group_id}>
                    {group?.name}
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
      </div>
    </div>
  );
};
