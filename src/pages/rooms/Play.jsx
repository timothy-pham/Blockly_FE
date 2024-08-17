import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
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
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const info = localStorage.getItem("authToken");
  const { user } = JSON.parse(info);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setBlockDetail(current);
      setCurrentQuestionIndex(index);
      haveData = true;
    }
    return haveData;
  };

  const setQuestions = async (res) => {
    try {
      const blocks = res?.meta_data?.blocks;
      if (blocks) {
        const data = blocks.map((item) => ({
          ...item,
          answered: false,
        }));
        setRows(data);
        if (data.length > 0) {
          // checkCurrentQuestion(room.users, initialBlockDetail?.block_id);
          const count = res?.users?.filter((v) => v.user_id === user.user_id)[0]
            ?.blocks?.length;
          setCurrentQuestionIndex(count - 1);
          setBlockDetail(rows[count - 1]);
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
        // // check status room
        if (res?.status !== "playing" && res?.status !== "finished") {
          navigate(`/rooms`);
          return;
        } else {
          if (res?.status === "finished") {
            navigate(`/rooms/${id}/end-game`, { state: res });
            return;
          }
        }
        // check user in room and status = playing
        const userInRoom = res.users.find((u) => u.user_id === user.user_id);
        if (
          !userInRoom ||
          (userInRoom.status !== "playing" && userInRoom.status !== "finished")
        ) {
          navigate(`/rooms/${id}/watch`);
        }
        setRoomDetail(res);
        return res;
      }
    } catch (e) {
      console.log("can not fetch groups");
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      const fetchData = async () => {
        const res = await fetchRoomData();
        await setQuestions(res);
        setRanks(res?.users);
      };
      fetchData();
      hasFetched.current = true; // Ensure it only runs once
    }
  }, []);

  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event) => {
      const position = { x: event.clientX, y: event.clientY };
      setCursorPosition(position);
      socket.emit("cursorPosition", { position, userId: user.user_id });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const handleNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < rows.length) {
      setCurrentQuestionIndex(nextIndex);
      setBlockDetail(rows[nextIndex]);
      saveToLocalStorage(rows, rows[nextIndex], nextIndex);
    }
  };

  const rankingUpdate = (data) => {
    if (rows.length === 0 || ranks.length === 0) return;
    const is_done = checkFinished;
    if (is_done) {
      socket.emit("user_finish");
    }
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

    // check user.blocks.length
    const count = data?.users?.filter((v) => v.user_id === user.user_id)[0]
      ?.blocks?.length;

    if (count > currentQuestionIndex && count < rows.length) {
      setCurrentQuestionIndex(count);
      setBlockDetail(rows[count]);
    }
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

    socket.on("user_finish", (data) => {
      userFinish(data);
    });

    return () => {
      socket.off("ranking_update");
      socket.off("receive_messages");
      socket.off("end_game");
      socket.off("user_joined");
      socket.off("user_finish");
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

  const handleSendMessage = (text) => {
    socket.emit("send_message", {
      room_id: id,
      user_id: user.user_id,
      message: text,
      user,
    });
  };

  const handleSubmitAnswer = async () => {
    setIsSubmitting(true); // Disable button
    const res = await apiPost("blocks/check-answer", {
      id: blockDetail?.block_id,
      answers: transformCodeBlockly(dataBlock.code),
    });
    if (res && res.correct) {
      socket.emit("ranking_update", {
        block_id: blockDetail?.block_id,
        answered: true,
      });
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
      socket.emit("ranking_update", {
        block_id: blockDetail?.block_id,
        answered: true,
        wrong: true,
      });
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

    setTimeout(() => {
      setIsSubmitting(false);
    }, 500);
  };

  const handleSkipAnswer = () => {
    socket.emit("ranking_update", {
      block_id: blockDetail?.block_id,
      answered: true,
      wrong: true,
      skip: true,
    });
    handleNextQuestion();
    setShowDeleteDialog(false);
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

  const checkFinished = useMemo(() => {
    if (currentQuestionIndex === rows.length - 1) {
      const is_done =
        ranks.filter((r) => r.user_id === user.user_id)[0]?.blocks?.length ===
        rows.length;
      return is_done;
    } else {
      return false;
    }
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

  const renderProgress = useMemo(() => {}, [checkFinished]);

  return (
    <div class="container-body">
      <div
        style={{
          width: "95%",
          height: "fit-content",
        }}
        class="border-animation"
      >
        <div className="flex justify-between py-3">
          <Typography variant="h4">Phòng : {roomDetail?.name}</Typography>
          {!isNaN(timeLeft) && (
            <Typography variant="h5">
              Còn lại: {milisecondToSecondMinute(timeLeft)}
            </Typography>
          )}
          <div>
            <div className="flex gap-3 flex-wrap">
              {rows.map((val, index) => {
                return (
                  <Button
                    variant="contained"
                    key={index}
                    color={
                      checkWrongAnswer(val.block_id)
                        ? "error"
                        : checkTrueAnswer(val.block_id)
                        ? "success"
                        : "primary"
                    }
                    className={`shadow-md rounded-md py-2 px-4 transition-all duration-300 ${
                      index === currentQuestionIndex
                        ? "opacity-100"
                        : "opacity-50"
                    }`}
                  >
                    {index + 1}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
        <div>
          <Typography component="span">Đề bài: </Typography>
          <span className="font-semibold">{blockDetail?.question}</span>
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
        <div className="flex mt-3">
          <div className="flex-1">
            {blockDetail && !checkFinished && (
              <Box>
                <div>
                  <BlocklyLayout
                    setDataBlocks={setDataBlocks}
                    data={blockDetail?.data}
                    isEdit={false}
                  />
                </div>
                {!checkFinished && (
                  <div>
                    {currentQuestionIndex ===
                      rows.findIndex(
                        (row) => row.block_id === blockDetail?.block_id
                      ) && (
                      <Button
                        onClick={handleSubmitAnswer}
                        variant="contained"
                        disabled={blockDetail?.answered || isSubmitting}
                        sx={{ mt: 3, mb: 2 }}
                      >
                        Kiểm tra
                      </Button>
                    )}
                    <Button
                      onClick={() => setShowDeleteDialog(true)}
                      variant="contained"
                      disabled={
                        blockDetail?.answered ||
                        checkWrongAnswer(blockDetail?.block_id)
                      }
                      sx={{ ml: 3, mt: 3, mb: 2 }}
                      color="error"
                    >
                      Bỏ qua
                    </Button>
                  </div>
                )}
              </Box>
            )}
            {checkFinished && (
              <div>
                <div>
                  <Typography component="span">Đề bài: </Typography>
                  <span className="font-semibold">{blockDetail?.question}</span>
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
                <Typography>
                  Bạn đã hoàn thành bài thi của mình nhưng chưa đạt điểm tối đa!
                </Typography>
                <Typography>
                  Hãy chờ người chơi khác hoàn thành hoặc hết thời gian!
                </Typography>
                <Typography>
                  Kết quả sẽ được hiển thị sau khi kết thúc bài thi!
                </Typography>
                <Typography>Số điểm của bạn: {getScore()}</Typography>
              </div>
            )}
          </div>
          <div className="flex-1 ms-3">
            <div
              style={{
                height: "50vh",
                position: "relative",
                borderRadius: "10px",
              }}
              className="bg-white rounded-lg shadow-inner flex items-center justify-center"
            >
              <img
                src={blockDetail?.meta_data?.image || "/backgroundAuth.jpeg"}
                alt="block detail"
                class={
                  blockDetail?.meta_data?.image ? "play-img" : "play-img cover"
                }
              />
              <div
                style={{
                  position: "absolute",
                  top: "0",
                  left: "0",
                  backgroundColor: "rgba(0,0,0,0.8)",
                  color: "white",
                  padding: "5px",
                  borderTopLeftRadius: "10px",
                  borderBottomRightRadius: "10px",
                  border: "1px solid var(--red)",
                }}
              >
                Hình minh họa
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex-col">
              <Ranking ranks={ranks} rows={rows} />
            </div>
          </div>
        </div>
        <Dialog
          open={showDeleteDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            Bạn chắc chắn muốn bỏ qua câu hỏi này chứ?
          </DialogTitle>
          <DialogContent>
            <Typography>
              Nếu bỏ qua, bạn sẽ không thể trả lời lại câu này nữa!
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleSkipAnswer}
              color="primary"
              variant="contained"
            >
              Đồng ý
            </Button>
            <Button
              onClick={() => setShowDeleteDialog(false)}
              color="primary"
              autoFocus
              variant="contained"
            >
              Hủy
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};
