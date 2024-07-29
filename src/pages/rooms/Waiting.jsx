import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  Dialog,
  Autocomplete,
  TextField
} from "@mui/material";
import { socket } from "../../socket";
import { apiGet, apiGetDetail } from "../../utils/dataProvider";
import { ChatBox } from "../../components/Chat/ChatBox";
import CooldownDialog from "../../components/CooldownDialog";
import { toast } from "react-toastify";
import { toastOptions } from "../../constant/toast";
const MAX_BOT = 4;
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
  const [userOnlineList, setUserOnlineList] = useState([]);
  const [showDialogInvite, setShowDialogInvite] = useState(false);
  const [listInvited, setListInvited] = useState([]);
  // BOT
  const [botConfig, setBotConfig] = useState(null);
  const [showChooseBot, setShowChooseBot] = useState(false);
  const [botLevel, setBotLevel] = useState(null);
  // END BOT
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

  const fetchUserOnline = async () => {
    try {
      const res = await apiGet("rooms/users-online");
      if (res) {
        let temp = []
        res.forEach((user) => {
          let isValid = true;
          roomDetail.users.forEach((roomUser) => {
            if (user.user_id == roomUser.user_id) {
              isValid = false;
            }
          })
          if (isValid) {
            temp.push(user);
          }
        })
        setUserOnlineList(temp);
        setShowDialogInvite(true);
      }
    } catch (e) {
      console.log("can not fetch users online");
    }
  }


  const fetchBotconfig = async () => {
    try {
      const res = await apiGet("rooms/bot-config");
      if (res) {
        setBotConfig(res);
      }
    } catch (e) {
      console.log("can not fetch bot config");
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
      fetchBotconfig();
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

    socket.on("kick_user", (data) => {
      kickUser(data);
    });

    return () => {
      socket.off("user_joined");
      socket.off("user_ready");
      socket.off("user_left");
      socket.off("receive_messages");
      socket.off("start_game");
      socket.off("kick_user");
    };
  }, [socket]);

  const addBot = () => {
    if (botLevel) {
      socket.emit("add_bot", {
        room_id: id,
        bot_level: botLevel
      });
      setShowChooseBot(false);
    } else {
      toast.error(
        `Vui lòng chọn độ khó cho máy!`,
        toastOptions
      );
    }
  }
  const handleSendMessage = (text) => {
    socket.emit("send_message", {
      room_id: id,
      user_id: user?.user_id,
      message: text,
      user,
    });
  };

  const deleteOldQuestions = async () => {
    localStorage.removeItem("questions");
    localStorage.removeItem("current");
    localStorage.removeItem("index");
  };

  const startGame = (data) => {
    if (data?.status === "playing") {
      deleteOldQuestions();
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
    socket?.emit("user_ready", !ready);
    setReady(!ready);
  };

  const checkHost = (user, userList) => {
    return userList.some((v) => v?.user_id === user?.user_id && v.is_host);
  };

  const kickUser = (data) => {
    const { room_data, userKicked } = data;
    if (userKicked.user_id === user.user_id) {
      toast.error(
        `Bạn đã bị chủ phòng đá ra khỏi phòng!`,
        toastOptions
      );
      navigate("/rooms");
    } else {
      setUserList(room_data?.users.filter((v) => v.is_connected));
    }
  }

  const countBot = (userList) => {
    return userList.filter((v) => v.is_bot).length;
  }

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
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button
            onClick={() => {
              fetchUserOnline();
            }}
            variant="contained"
            sx={{ mt: 3, mb: 2, mr: 2 }}
          >
            Mời mọi người
          </Button>
          <Button
            onClick={() => {
              setShowChooseBot(true);
            }}
            variant="contained"
            sx={{ mt: 3, mb: 2, mr: 2 }}
            disabled={countBot(userList) >= MAX_BOT}
          >
            Thêm máy
          </Button>
          <Button
            onClick={() => {
              socket?.emit("start_game", { room_id: id });
            }}
            disabled={
              !(userList && userList?.every((v) => v.is_ready)) ||
              !checkHost(user, userList) ||
              !(userList?.length > 1)
            }
            variant="contained"
            sx={{
              mt: 3, mb: 2,
              display:
                !checkHost(user, userList) ? "none" : "block"
            }}
          >
            Bắt đầu
          </Button>
        </div>
      </div>

      <div className="flex">
        <div className="w-fullflex flex-col justify-center flex-1">
          <TableContainer sx={{ boxShadow: "none" }}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow className="[&>*]:font-bold">
                  <TableCell>Tên</TableCell>
                  <TableCell>Sẵn sàng</TableCell>
                  <TableCell>Điểm tích lũy </TableCell>
                  <TableCell>Số trận đã đấu</TableCell>
                  <TableCell>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userList.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell component="th" scope="row">
                      <div className="flex items-center ">
                        <img
                          src={row?.user_data?.meta_data?.avatar}
                          // alt={initials}
                          className="w-16 h-16 rounded-full  object-cover mr-2"
                        />
                        <div>{row?.user_data.name}</div>
                      </div>
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
                    <TableCell>
                      {checkHost(user, userList) && row.user_id !== user.user_id && (
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => {
                            socket?.emit("kick_user", {
                              room_id: id,
                              user_id: row.user_id,
                            });
                          }}
                        >
                          Kick
                        </Button>
                      )}
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

      <Dialog
        open={showDialogInvite}
        onClose={() => {
          setShowDialogInvite(false)
          setListInvited([]);
        }}
      >
        <div
          className="p-4"
        >
          <Typography variant="h4">Danh sách người chơi online</Typography>
          <TableContainer sx={{ boxShadow: "none" }} component={Paper}>
            <Table aria-label="simple table">
              <TableBody>
                {userOnlineList.map((row, index) => {
                  const data = row.user
                  return (
                    <TableRow key={index}>
                      <TableCell component="th" scope="row">
                        <div className="flex items-center ">
                          <img
                            src={data?.meta_data?.avatar || "/default_avatar.png"}
                            className="w-8 h-8 rounded-full  object-cover mr-2"
                          />
                          <div>{data.name}</div>
                        </div>
                      </TableCell>
                      <TableCell style={{ width: '200px', textAlign: 'right' }}>
                        <Button
                          disabled={listInvited.includes(data.user_id)}
                          variant="contained"
                          onClick={() => {
                            socket?.emit("invite_user", {
                              room: roomDetail,
                              user_id: data.user_id,
                            });
                            setListInvited([...listInvited, data.user_id]);
                          }}
                        >
                          Mời
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <Button
            className="mt-5 w-full"
            variant="contained"
            color="error"
            onClick={() => {
              setShowDialogInvite(false)
              setListInvited([]);
            }}>
            Đóng
          </Button>
        </div>
      </Dialog>

      <Dialog
        open={showChooseBot}
        onClose={() => {
          setShowChooseBot(false);
        }}
        fullWidth
      >
        <div
          className="p-4"
          style={{
            minHeight: "600px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div
            className="text-center"
          >
            <Typography variant="h4">Chọn độ khó cho máy</Typography>
            <Autocomplete
              disablePortal
              id="bot_level"
              fullWidth
              options={botConfig}
              getOptionLabel={(option) => option?.name}
              style={{
                fontSize: "50px"
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Độ khó"
                  name="bot_level"
                  margin="normal"
                />
              )}
              onChange={(e, value) => setBotLevel(value?.level)}
            />
          </div>
          <div>
            <Button
              className="mt-5 w-full"
              variant="contained"
              color="success"
              onClick={() => {
                addBot();
              }}>
              Thêm máy
            </Button>
            <Button
              style={{
                marginTop: "15px"
              }}
              className="w-full"
              variant="contained"
              color="error"
              onClick={() => {
                setShowChooseBot(false);
              }}>
              Đóng
            </Button>
          </div>
        </div>
      </Dialog>

    </Paper>
  );
};
