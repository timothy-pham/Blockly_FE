import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  Paper,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Button,
  Chip,
  Typography,
} from "@mui/material";
import {
  milisecondToSecondMinute,
  transformCodeBlockly,
} from "../../utils/transform";
import { apiPost, apiGet, apiGetDetail } from "../../utils/dataProvider";
import { BlocklyLayout } from "../../components/Blockly";
import { socket } from "../../socket";
import Ranking from "./components/Ranking";
import moment from "moment";
import LinearProgress, {
  LinearProgressProps,
} from "@mui/material/LinearProgress";
import LinearWithValueLabel from "../../components/progress/Progress";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import { getColor, getLabel } from "../../utils/levelParse";

export const Play = () => {
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

  const info = localStorage.getItem("authToken");
  const { user } = JSON.parse(info);

  const [timeLeft, setTimeLeft] = useState();

  const saveToLocalStorage = (questions, current, index) => {
    localStorage.setItem("questions", JSON.stringify(questions));
    localStorage.setItem("current", JSON.stringify(current));
    localStorage.setItem("index", JSON.stringify(index));
  }

  const checkLocalStorage = () => {
    let haveData = false;
    const questions = JSON.parse(localStorage.getItem("questions"));
    const current = JSON.parse(localStorage.getItem("current"));
    const index = JSON.parse(localStorage.getItem("index"));
    if (questions && current) {
      setRows(questions);
      setBlockDetail(current);
      setCurrentQuestionIndex(index);
      haveData = true;
    }
    return haveData;
  }

  const fetchCollection = async () => {
    try {
      const haveData = checkLocalStorage();
      if (!haveData) {
        const res = await apiGet(`blocks/random?room_id=${id}`);
        if (res) {
          const data = res.map((item) => ({
            ...item,
            answered: false,
          }));
          setRows(data);
          if (data.length > 0) {
            const initialBlockDetail = data[0];
            setBlockDetail(initialBlockDetail);
          }
          saveToLocalStorage(data, data[0], 0);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRoomData = async () => {
    try {
      const res = await apiGetDetail("rooms", id);
      if (res) {
        if (res?.status !== 'playing') {
          navigate(`/rooms`);
          return;
        }
        setRoomDetail(res);
      }
    } catch (e) {
      console.log("can not fetch groups");
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      fetchCollection();
      fetchRoomData();
      hasFetched.current = true; // Ensure it only runs once
    }
  }, []);

  const handleNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < rows.length) {
      setCurrentQuestionIndex(nextIndex);
      setBlockDetail(rows[nextIndex]);
      saveToLocalStorage(rows, rows[nextIndex], nextIndex);
    }
  };

  // const updateHistory = async (blockDetail) => {
  //   try {
  //     const res = await apiPatch(
  //       `histories/add-result`,
  //       history?.histories_id,
  //       {
  //         block_id: blockDetail.block_id,
  //         block_state: blockDetail.data,
  //         start_time: history.created_at,
  //         end_time: moment().toISOString(),
  //         correct: true,
  //       }
  //     );
  //   } catch (e) {
  //     console.error(e);
  //   }
  // };

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
    setRanks(sortedRanks);
  };
  const connectToRoom = () => {
    socket.emit("join_room", { room_id: id, user_id: user.user_id, user });
  };

  useEffect(() => {
    connectToRoom();
    // for reload page
    socket.on("user_joined", (data) => {
      rankingUpdate(data);
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

    return () => {
      socket.off("ranking_update");
      socket.off("receive_messages");
      socket.off("end_game");
      socket.off("user_joined");
    };
  }, [socket]);

  const endGame = (data) => {
    if (data) {
      navigate(`/rooms/${id}/end-game`, { state: data });
    }
    console.log("endgame +++>", data);
  };

  const receiveMessages = (data) => {
    setMessages((oldMessages) => [...oldMessages, data]);
  };

  const handleSendMessage = (text) => {
    socket.emit("send_message", {
      room_id: id,
      user_id: user.user_id,
      message: text,
      user,
    });
  };

  const handleSubmitAnswer = async () => {
    const res = await apiPost("blocks/check-answer", {
      id: blockDetail.block_id,
      answers: transformCodeBlockly(dataBlock.code),
    });
    if (res && res.correct) {
      const answeredQuestion = rows.map((v, index) => {
        if (index === currentQuestionIndex) {
          socket.emit("ranking_update", {
            block_id: blockDetail.block_id,
            answered: true,
          });
          return { ...v, data: dataBlock.data, answered: true };
        }
        return v;
      });
      setRows(answeredQuestion);
      handleNextQuestion();
      toast("Bạn giỏi wa!", {
        position: "top-left",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        type: "success",
      });
    } else {
      toast("Tiếc quá! Câu trả lời chưa đúng rồi :<", {
        position: "top-left",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        type: "error",
      });
    }
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

  // handle enter key event
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSubmitAnswer();
    }
  };
  // listen to keydown event
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
  return (
    <Paper
      sx={{
        padding: 3,
        height: "100%",
        borderRadius: "20px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className="flex justify-between">
        <Typography variant="h4">Phòng : {roomDetail?.name}</Typography>
        {!isNaN(timeLeft) && (
          <Typography variant="h4">
            Còn lại: {milisecondToSecondMinute(timeLeft)}
          </Typography>
        )}
      </div>
      <div className="border-b border-solid border-gray-300 pb-10 my-5">
        <Typography variant="subtitle1" sx={{ marginBottom: "10px" }}>
          Câu hỏi
        </Typography>

        <div className="flex-cols">
          <div style={{ width: "100%" }}>
            <LinearWithValueLabel
              numberQuestions={rows.length}
              currentQuestionIndex={currentQuestionIndex}
            />
          </div>
        </div>
      </div>
      <div className="flex">
        <div className="flex-1">
          {blockDetail && (
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
                  label={
                    getLabel(blockDetail?.level)
                  }
                  sx={{ width: "fit-content" }}
                />
              </div>

              <div className="my-2">
                <BlocklyLayout
                  setDataBlocks={setDataBlocks}
                  data={blockDetail.data}
                  isEdit={false}
                />
              </div>
              {currentQuestionIndex ===
                rows.findIndex(
                  (row) => row.block_id === blockDetail.block_id
                ) && (
                  <Button
                    onClick={handleSubmitAnswer}
                    variant="contained"
                    disabled={blockDetail.answered}
                    sx={{ mt: 3, mb: 2 }}
                  >
                    Kiểm tra
                  </Button>
                )}
            </Box>
          )}
        </div>
        <div className="flex-1 mt-6">
          {blockDetail?.meta_data?.image && (
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
            <Ranking ranks={ranks} rows={rows} />
          </div>
        </div>
      </div>
    </Paper>
  );
};
