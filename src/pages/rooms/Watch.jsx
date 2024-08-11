import React, { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Paper, Box, Button, Chip, Typography } from "@mui/material";
import {
  milisecondToSecondMinute,
  transformCodeBlockly,
} from "../../utils/transform";
import { apiPost, apiGet, apiGetDetail } from "../../utils/dataProvider";
import { BlocklyLayout } from "../../components/Blockly";
import { socket } from "../../socket";
import Ranking from "./components/Ranking";
import moment from "moment";
import "react-toastify/dist/ReactToastify.css";
import { getColor, getLabel } from "../../utils/levelParse";

export const Watch = () => {
  const { collection_id, id } = useParams();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [blockDetail, setBlockDetail] = useState();
  const [dataBlock, setDataBlocks] = useState();
  const [roomDetail, setRoomDetail] = useState();
  const hasFetched = useRef(false);
  const [ranks, setRanks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const info = localStorage.getItem("authToken");
  const { user: myData } = JSON.parse(info);
  const [user, setUser] = useState(null);
  const [cursorPosition, setCursorPosition] = useState();
  const [timeLeft, setTimeLeft] = useState();

  const saveToLocalStorage = (questions, current, index) => {
    localStorage.setItem("questions", JSON.stringify(questions));
    localStorage.setItem("current", JSON.stringify(current));
    localStorage.setItem("index", JSON.stringify(index));
  };

  const checkLocalStorage = () => {
    let haveData = false;
    const questions = JSON.parse(localStorage.getItem("questions"));
    const current = JSON.parse(localStorage.getItem("current"));
    const index = JSON.parse(localStorage.getItem("index"));
    if (questions && current) {
      setRows(questions);
      haveData = true;
    }
    return haveData;
  };

  const setQuestions = async (res) => {
    try {
      if (res) {
        const data = res.map((item) => ({
          ...item,
          answered: false,
        }));
        setRows(data);
      }

    } catch (e) {
      console.error(e);
    }
  };

  const fetchRoomData = async () => {
    try {
      const res = await apiGetDetail("rooms", id);
      if (res) {
        if (res?.status !== "playing") {
          navigate(`/rooms`);
          return;
        }
        setRoomDetail(res);
        setRanks(res?.users);
        return res;
      }
    } catch (e) {
      console.log("can not fetch groups");
    }
  };

  // THEO DÕI con trỏ
  const updateUserFollowing = async (res, user_id) => {
    if (!res) return;
    const userFollowing =
      res?.users?.filter((v) => v.user_id === user_id)[0] || res.users[0];
    setUser(userFollowing?.user_data);
    const count = userFollowing?.blocks?.length || 0;
    setCurrentQuestionIndex(count);
    let blocks_data = res?.meta_data?.blocks
    setBlockDetail(blocks_data[count]);
    if (
      userFollowing &&
      (userFollowing.user_id !== user?.user_id || user === null)
    ) {
      handleFollowUser(userFollowing?.user_id);

    }
  };

  const handleFollowUser = (newUserToFollow) => {
    // Rời khỏi room hiện tại nếu đang theo dõi người dùng
    if (user) {
      socket.emit("unfollow_user", { user_to: user.user_id, room_id: id });
    }

    // Tham gia vào room mới
    socket.emit("follow_user", { user_to: newUserToFollow, room_id: id });
  };
  // END THEO DÕI con trỏ

  useEffect(() => {
    localStorage.removeItem("questions");
    localStorage.removeItem("current");
    localStorage.removeItem("index");
    if (!hasFetched.current) {
      const fetchData = async () => {
        const res = await fetchRoomData();
        await setQuestions(res?.meta_data?.blocks);
        updateUserFollowing(res);
      };
      fetchData();
      hasFetched.current = true; // Ensure it only runs once
    }
  }, []);

  const rankingUpdate = (data) => {
    const sortedRanks = [...data.users.filter((v) => v.is_connected)].sort(
      (a, b) => {
        if (a.score !== b.score) {
          return b.score - a.score;
        } else {
          return a.end_timestamp - b.end_timestamp;
        }
      }
    );
    setRoomDetail(data);
    setRanks(sortedRanks);

    const userFollowData = data?.users?.filter(
      (v) => v.user_id === user?.user_id
    )[0];

    if (userFollowData) {
      const count = userFollowData?.blocks?.length || 0
      if (count > currentQuestionIndex) {
        console.log("count2", count);
        setCurrentQuestionIndex(count);
        setBlockDetail(rows[count]);
      }
    }

  };

  const connectToRoom = () => {
    socket.emit("join_room", { room_id: id, user_id: myData.user_id, myData });
  };

  useEffect(() => {
    // for reload page
    connectToRoom();
    socket.on("user_joined", (data) => {
      // rankingUpdate(data);
    });

    socket.on("ranking_update", (data) => {
      rankingUpdate(data);
    });

    socket.on("receive_messages", (data) => {
      receiveMessages(data);
    });

    socket.on("end_game", (data) => {
      endGame(data);
    });

    socket.on("user_finish", (data) => {
      userFinish(data);
    });

    socket.on("cursorPosition", (data) => {
      if (data) {
        setCursorPosition(data);
      }
    });

    return () => {
      socket.off("ranking_update");
      socket.off("receive_messages");
      socket.off("end_game");
      socket.off("user_joined");
      socket.off("user_finish");
      socket.off("cursorPosition");
    };
  }, [socket, roomDetail]);

  const userFinish = (data) => {
    const sortedRanks = [...data.users.filter((v) => v.is_connected)].sort(
      (a, b) => {
        if (a.score !== b.score) {
          return b.score - a.score;
        } else {
          return a.end_timestamp - b.end_timestamp;
        }
      }
    );
    setRanks(sortedRanks);
  };

  const endGame = (data) => {
    if (data) {
      navigate(`/rooms/${id}/end-game`, { state: data });
    }
  };

  const receiveMessages = (data) => {
    setMessages((oldMessages) => [...oldMessages, data]);
  };

  useEffect(() => {
    let timefromNow = moment().diff(roomDetail?.meta_data?.started_at);
    let timeLeft = roomDetail?.meta_data?.timer * 60 * 1000 - timefromNow;
    timeLeft = timeLeft + 5000;
    setTimeLeft(timeLeft);
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime === 0) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [roomDetail]);

  const checkFinished = useMemo(() => {
    let is_done = false;
    is_done =
      ranks.filter((r) => r?.user_id === user?.user_id)[0]?.blocks?.length ===
      rows.length;
    return is_done;
  }, [roomDetail, rows, ranks]);

  const getScore = () => {
    let score = 0;
    rows.forEach((row) => {
      if (row.answered) {
        score++;
      }
    });
    return `${score}/${rows.length}`;
  };

  const onChangeUser = (data) => {
    data?.user_id && updateUserFollowing(roomDetail, data?.user_id);
  };

  const checkWrongAnswer = (block_id) => {
    const userIndex = ranks.findIndex((v) => v.user_id === user.user_id);
    if (userIndex !== -1) {
      const user = ranks[userIndex];
      if (user.wrong_answers?.[block_id] >= 3) {
        return true;
      }
    }
    return false;
  };

  const checkTrueAnswer = (block_id) => {
    const userIndex = ranks.findIndex((v) => v.user_id === user.user_id);
    if (userIndex !== -1) {
      const user = ranks[userIndex];
      if (user.blocks?.includes(block_id)) {
        return true;
      }
    }
    return false;
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
      {/* cursor view */}

      {cursorPosition && (
        <div
          style={{
            position: "fixed",
            zIndex: 9999,
            top: cursorPosition.y,
            left: cursorPosition.x,
            width: "50px",
            height: "50px",
          }}
        >
          <img
            src={"/cursor.png"}
            // style hình tròn
            className="w-10 h-10"
          />
          <img
            src={
              user?.meta_data?.avatar
                ? user?.meta_data?.avatar
                : "/default_avatar.png"
            }
            // style hình tròn
            className="w-10 h-10 rounded-full  object-cover"
          />
        </div>
      )}

      <div className="flex justify-between">
        <Typography variant="h4">Phòng: {roomDetail?.name}</Typography>
        {!isNaN(timeLeft) && (
          <Typography variant="h4">
            Còn lại: {milisecondToSecondMinute(timeLeft)}
          </Typography>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Typography variant="h6">Đang theo dõi: </Typography>
        <div className="flex items-center gap-2">
          <img
            src={
              user?.meta_data?.avatar
                ? user?.meta_data?.avatar
                : "/default_avatar.png"
            }
            className="w-10 h-10 rounded-full  object-cover mr-1"
          />
          <Typography variant="h6">{user?.name}</Typography>
        </div>
      </div>

      <div className="border-b border-solid border-gray-300 pb-10 my-5">
        <Typography variant="subtitle1" className="text-lg mb-4">
          Câu hỏi
        </Typography>

        <div className="flex gap-3 flex-wrap">
          {rows.map((val, index) => (
            <Button
              variant="contained"
              className={`shadow-md rounded-md py-2 px-4 transition-all duration-300`}
              key={index}
              color={
                checkWrongAnswer(val.block_id)
                  ? "error"
                  : checkTrueAnswer(val.block_id)
                    ? "success"
                    : "primary"
              }
            >
              {index + 1}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex">
        <div className="flex-1">
          {blockDetail && !checkFinished && (
            <Box>
              <div>
                <Typography component="span">Đề bài: </Typography>
                <span className="font-semibold">{blockDetail.question}</span>
              </div>
              <div>
                <Typography component="span">Mức độ: </Typography>
                <Chip
                  style={{
                    backgroundColor: getColor(blockDetail?.level),
                  }}
                  label={getLabel(blockDetail?.level)}
                  sx={{ width: "fit-content" }}
                />
              </div>
              <BlocklyLayout
                setDataBlocks={setDataBlocks}
                data={blockDetail.data}
                isEdit={false}
              />

            </Box>
          )}
          <div className="my-2">
            {checkFinished && (
              <div>
                <Typography>
                  Người chơi đã hoàn thành bài thi của mình nhưng chưa đạt điểm tối
                  đa!
                </Typography>
                <Typography>
                  Hãy chờ người chơi khác hoàn thành hoặc hết thời gian!
                </Typography>
                <Typography>
                  Kết quả sẽ được hiển thị sau khi kết thúc bài thi!
                </Typography>
                <Typography>Số điểm của người chơi: {getScore()}</Typography>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 mt-6">
          {blockDetail?.meta_data?.image && !checkFinished && (
            <div>
              <Typography variant="subtitle1" sx={{ marginBottom: "10px" }}>
                Hình ảnh
              </Typography>
              <div className=" max-h-[400px] p-3 bg-white rounded-lg shadow-inner flex items-center justify-center">
                <img
                  src={blockDetail?.meta_data?.image}
                  alt="block detail"
                  className="play-img w-full max-h-[400px] rounded-lg "
                />
              </div>
            </div>
          )}
        </div>
        <div className="flex-1 mt-6">
          <div className="flex-col">
            <Ranking ranks={ranks} rows={rows} onChangeUser={onChangeUser} />
          </div>
        </div>
      </div>
    </Paper>
  );
};
