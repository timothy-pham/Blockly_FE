import React, { useEffect, useState, useRef, useMemo } from "react";
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
    const [user, setUser] = useState({});

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

    const fetchCollection = async (count) => {
        try {
            const haveData = checkLocalStorage();
            if (!haveData) {


                const res = await apiGet(`blocks/random?room_id=${id}&count=${count}`);
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
                if (res?.status !== "playing") {
                    navigate(`/rooms`);
                    return;
                }
                setRoomDetail(res);
                setRanks(res.users);
                updateUserFollowing(res);
                return res;
            }
        } catch (e) {
            console.log("can not fetch groups");
        }
    };

    const updateUserFollowing = async (res, user_id) => {
        const userFollowing = res?.users?.filter((v) => v.user_id === user_id)[0] || res.users[0];
        setUser(userFollowing?.user_data);
        let currentQuestionIdx = userFollowing?.blocks?.length || 0;
        setCurrentQuestionIndex(currentQuestionIdx);
    }

    useEffect(() => {
        localStorage.removeItem("questions");
        localStorage.removeItem("current");
        localStorage.removeItem("index");
        if (!hasFetched.current) {
            const fetchData = async () => {
                const res = await fetchRoomData();
                const count = res?.meta_data?.count || 5;
                await fetchCollection(count);
            };
            fetchData();
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
        updateUserFollowing(data, user?.user_id);
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
    }, [socket]);

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
            let count = 0;
            const answeredQuestion = rows.map((v, index) => {
                if (index === currentQuestionIndex) {
                    const answered_wrong = v.answered_wrong ? v.answered_wrong + 1 : 1;
                    count = answered_wrong;
                    return { ...v, data: dataBlock.data, answered_wrong };
                }
                return v;
            });
            setRows(answeredQuestion);
            if (count === 3) {
                handleNextQuestion();
            }
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

    const handleSkipAnswer = () => {
        const answeredQuestion = rows.map((v, index) => {
            if (index === currentQuestionIndex) {
                return { ...v, answered_wrong: 3 };
            }
            return v;
        });
        setRows(answeredQuestion);
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
                rows[currentQuestionIndex].answered ||
                rows[currentQuestionIndex].answered_wrong === 3;
            if (is_done) {
                console.log("==========>done");
                socket.emit("user_finish", {
                    wrong_answers: rows.filter((v) => v.answered_wrong === 3).length,
                });
            }
            return is_done;
        } else {
            return false;
        }
    }, [rows]);

    const getScore = () => {
        let score = 0;
        rows.forEach((row) => {
            if (row.answered) {
                score++;
            }
        });
        return `${score}/${rows.length}`;
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
            <div className="flex justify-between">
                <Typography variant="h4">Phòng: {roomDetail?.name}</Typography>
                {!isNaN(timeLeft) && (
                    <Typography variant="h4">
                        Còn lại: {milisecondToSecondMinute(timeLeft)}
                    </Typography>
                )}
            </div>
            <div
                className="flex items-center gap-2">
                <Typography variant="h6">Đang theo dõi: </Typography>
                <div
                    className="flex items-center gap-2"
                >
                    <img
                        src={user?.meta_data?.avatar ? user?.meta_data?.avatar : "/default_avatar.png"}
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
                            className={`shadow-md rounded-md py-2 px-4 transition-all duration-300 ${index === currentQuestionIndex
                                ? "opacity-100"
                                : "opacity-50"
                                }`}
                            key={index}
                            color={
                                val.answered_wrong === 3
                                    ? "error"
                                    : val.answered
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
                                    label={getLabel(blockDetail?.level)}
                                    sx={{ width: "fit-content" }}
                                />
                            </div>

                            <div className="my-2">
                                {checkFinished ? (
                                    <div>
                                        <Typography>
                                            Bạn đã hoàn thành bài thi của mình nhưng chưa đạt điểm tối
                                            đa!
                                        </Typography>
                                        <Typography>
                                            Hãy chờ người chơi khác hoàn thành hoặc hết thời gian!
                                        </Typography>
                                        <Typography>
                                            Kết quả sẽ được hiển thị sau khi kết thúc bài thi!
                                        </Typography>
                                        <Typography>Số điểm của bạn: {getScore()}</Typography>
                                    </div>
                                ) : (
                                    <BlocklyLayout
                                        setDataBlocks={setDataBlocks}
                                        data={blockDetail.data}
                                        isEdit={false}
                                    />
                                )}
                            </div>
                        </Box>
                    )}
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
                        <Ranking ranks={ranks} rows={rows} />
                    </div>
                </div>
            </div>

        </Paper>
    );
};
