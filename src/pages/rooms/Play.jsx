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
import {
  post,
  fetchData,
  fetchDataDetail,
} from "../../utils/dataProvider";
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
  const fetchCollection = async () => {
    try {
      const res = await fetchData(`blocks/random?room_id=${id}`);
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
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRoomData = async () => {
    try {
      const res = await fetchDataDetail("rooms", id);
      if (res) {
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
    }
  };

  // const updateHistory = async (blockDetail) => {
  //   try {
  //     const res = await updateData(
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
    const res = await post("blocks/check-answer", {
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
        <ToastContainer
          position="top-left"
          autoClose={1000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          stacked={true}
        />
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
                  color={
                    blockDetail.level === 1
                      ? "success"
                      : blockDetail.level === 2
                        ? "warning"
                        : "error"
                  }
                  label={
                    blockDetail.level === 1
                      ? "Dễ"
                      : blockDetail.level === 2
                        ? "Bình thường"
                        : "Khó"
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
        <div className="flex-1">
          <div className="flex-col">
            <Ranking ranks={ranks} rows={rows} />
          </div>
        </div>
      </div>
    </Paper>
  );
};
