import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import io from "socket.io-client";
import {
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Chip,
} from "@mui/material";
import { socket } from "../../socket";
import { apiGet, apiGetDetail } from "../../utils/dataProvider";
import { ChatBox } from "../../components/Chat/ChatBox";
import CooldownDialog from "../../components/CooldownDialog";

export const Waiting = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const info = localStorage.getItem("authToken");
  const { user } = JSON.parse(info);
  // Before Login
  const [ready, setReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetched = useRef(false);
  const [roomDetail, setRoomDetail] = useState();

  // After Login
  const [userList, setUserList] = useState([]);

  const [messages, setMessages] = useState([]);

  const [cooldown, setCooldown] = useState(0);

  const fetchRoomData = async () => {
    try {
      const res = await apiGetDetail("rooms", id);
      if (res) {
        setRoomDetail(res);
      }
    } catch (e) {
      console.log("can not fetch rooms");
    }
  };

  const fetchRoom = async () => {
    try {
      const res = await apiGet(`rooms/${id}`);
      if (res) {
        if (res.status === "waiting") {
          setIsLoading(false);
        }
      } else {
        navigate("/rooms");
      }
    } catch (e) {
      console.log("can not fetch rooms");
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      fetchRoom();
      fetchRoomData();
      connectToRoom();

      socket.on("disconnect", () => {
        console.log("Disconnected from server");
      });

      hasFetched.current = true; // Ensure it only runs once
    }
  });

  useEffect(() => {
    socket.on("user_joined", (data) => {
      userJoin(data);
    });

    socket.on("user_ready", (data) => {
      userReady(data);
    });

    socket.on("user_left", (data) => {
      userLeft(data);
    });

    socket.on("receive_messages", (data) => {
      receiveMessages(data);
    });

    socket.on("start_game", (data) => {
      startGame(data);
    });

    return () => {
      socket.off("user_joined");
      socket.off("user_ready");
      socket.off("user_left");
      socket.off("receive_messages");
      socket.off("start_game");
    };
  }, [socket]);

  const handleSendMessage = (text) => {
    socket.emit("send_message", {
      room_id: id,
      user_id: user?.user_id,
      message: text,
      user,
    });
  };

  const startGame = (data) => {
    if (data?.status === "playing") {
      setCooldown(5);
      const countdown = setInterval(() => {
        setCooldown((prev) => {
          if (prev === 1) {
            clearInterval(countdown);
            navigate(`/rooms/${id}/play`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const receiveMessages = (data) => {
    setMessages((oldMessages) => [...oldMessages, data]);
  };

  const userLeft = (data) => {
    setUserList((prevUserList) =>
      prevUserList.filter((v) => v.user_id !== data)
    );
  };

  const userJoin = (data) => {
    setUserList(data.users.filter((v) => v.is_connected));
  };

  const userReady = (data) => {
    setUserList(data.users.filter((v) => v.is_connected));
  };

  const connectToRoom = () => {
    socket.emit("join_room", { room_id: id, user_id: user.user_id, user });
  };

  const handleReady = () => {
    console.log("readyyyy", !ready);
    socket?.emit("user_ready", !ready);
    setReady(!ready);
  };

  const checkHost = (user, userList) => {
    return userList.some((v) => v?.user_id === user?.user_id && v.is_host);
  };

  return (
    <Paper
      sx={{
        padding: 3,
        height: "100%",
        borderRadius: "20px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Typography variant="h4">Phòng : {roomDetail?.name}</Typography>
      <div className="flex  justify-between">
        <Button onClick={handleReady} variant="contained" sx={{ mt: 3, mb: 2 }}>
          {ready ? "Hủy sẵn sàng" : "Sẵn sàng"}
        </Button>
        <Button
          onClick={() => {
            socket?.emit("start_game", { room_id: id });
          }}
          disabled={
            !userList.every((v) => v.is_ready) ||
            !checkHost(user, userList) ||
            !(userList.length > 1)
          }
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Bắt đầu
        </Button>
      </div>

      <div className="flex">
        <div className="w-fullflex flex-col justify-center flex-1">
          <TableContainer sx={{ boxShadow: "none" }} component={Paper}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow className="[&>*]:font-bold">
                  <TableCell>Tên</TableCell>
                  <TableCell>Sẵn sàng</TableCell>
                  <TableCell>Điểm tích lũy </TableCell>
                  <TableCell>Số trận đã đấu</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userList.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell component="th" scope="row">
                      {row?.user_data.name}
                    </TableCell>
                    <TableCell>
                      {row?.is_ready ? (
                        <Chip label="Sẵn sàng" color="success" />
                      ) : (
                        <Chip label="Chưa sẵn sàng" color="error" />
                      )}
                    </TableCell>

                    <TableCell>
                      {row?.user_data?.meta_data?.points || 0}
                    </TableCell>
                    <TableCell>
                      {row?.user_data?.meta_data?.matches || 0}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
        <div className="flex-1 ml-5">
          <ChatBox
            messages={messages}
            onSendMessage={handleSendMessage}
            userId={user?.user_id}
            avatar={user?.meta_data?.avatar}
            roomId={id}
          />
        </div>
      </div>
      <CooldownDialog open={cooldown > 0} cooldown={cooldown} />
    </Paper>
  );
};
