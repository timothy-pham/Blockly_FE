import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Button, Chip, Typography } from "@mui/material";
import { transformCodeBlockly } from "../../../utils/transform";
import {
  apiPost,
  apiGet,
  apiGetDetail,
  apiPatch,
} from "../../../utils/dataProvider";
import { BlocklyLayout } from "../../../components/Blockly";
import moment from "moment";
import { toast } from "react-toastify";
import { toastOptions } from "../../../constant/toast";
import { getColor, getLabel } from "../../../utils/levelParse";

export const LessonsDetail = () => {
  const { collection_id, group_id } = useParams();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [blockDetail, setBlockDetail] = useState();
  const [dataBlock, setDataBlocks] = useState();
  const [history, setHistory] = useState();
  const [groupDetail, setGroupDetail] = useState();
  const hasFetched = useRef(false);

  const createHistory = async (initialBlockDetail) => {
    try {
      const res = await apiPost(`histories`, {
        type: "normal",
        user_id: 1,
        group_id: Number(group_id),
        collection_id: Number(collection_id),
        result: [
          {
            block_id: initialBlockDetail.block_id,
            block_state: initialBlockDetail.data,
            start_time: moment().toISOString(),
            correct: false,
          },
        ],
        start_time: moment().toISOString(),
      });
      if (res) {
        setHistory(res);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchGroupDetail = async () => {
    try {
      const res = await apiGetDetail("groups", group_id);
      if (res) {
        setGroupDetail(res);
      }
    } catch (e) {
      console.log("can not fetch collection");
    }
  };

  const fetchBlock = async () => {
    try {
      const res = await apiGet(`blocks/search?group_id=${group_id}`);
      if (res) {
        const data = res.map((item) => ({
          ...item,
          answered: false,
        }));
        setRows(data);
        if (data.length > 0) {
          const initialBlockDetail = data[0];
          setBlockDetail(initialBlockDetail);
          createHistory(initialBlockDetail);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      fetchBlock();
      fetchGroupDetail();
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

  const updateHistory = async (blockDetail) => {
    try {
      const res = await apiPatch(
        `histories/add-result`,
        history?.histories_id,
        {
          block_id: blockDetail.block_id,
          block_state: blockDetail.data,
          start_time: history.created_at,
          end_time: moment().toISOString(),
          correct: true,
        }
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitAnswer = async () => {
    const res = await apiPost("blocks/check-answer", {
      id: blockDetail?.block_id,
      answers: transformCodeBlockly(dataBlock.code),
    });
    if (res && res.correct) {
      const answeredQuestion = rows.map((v, index) => {
        if (index === currentQuestionIndex) {
          updateHistory(v);
          return { ...v, data: dataBlock.data, answered: true };
        }
        return v;
      });
      setRows(answeredQuestion);
      toast.success(`Chúc mừng bạn đã làm đúng`, toastOptions);
      if (currentQuestionIndex === rows.length - 1) {
        navigate(`/collections/${collection_id}`);
      }
      handleNextQuestion();
    } else if (!res.correct) {
      toast.error(`Tiếc quá! :<, bạn đã sai gòyyyy`, toastOptions);
    }
  };
  // handle enter key event
  const handleKeyDown = (event) => {
    if (event.key === "Enter" && rows[currentQuestionIndex].answered === false) {
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
    <div class="cus-bg-black"
      style={{
        height: "100vh",
        padding: "20px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
        }}
      >
        <div className="flex justify-between py-3 px-5">
          <Typography variant="h4" className="text-3xl font-bold">
            {groupDetail?.name}
          </Typography>
          <div className="flex flex-col items-center">
            <div className="flex gap-5 flex-wrap">
              {rows.map((val, index) => (
                <Button
                  variant="contained"
                  style={{
                    backgroundColor: val.answered && "#4caf50"
                  }}
                  // disabled={index > 0 && !rows[index - 1].answered}
                  className={`${index === currentQuestionIndex
                    ? "bg-blue-500 text-white"
                    : "bg-white text-blue-500"
                    } shadow-md rounded-md py-2 px-4 transition-all duration-300`}
                  key={index}
                  onClick={() => {
                    setCurrentQuestionIndex(index);
                    setBlockDetail(val);
                  }}
                >
                  <span>{val.name}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 rounded-lg"
          sx={{
            backgroundColor: "var(--black)",
          }}
        >
          <Box className="p-5 rounded-lg shadow-sm"
            sx={{
              borderRadius: "10px",
              border: "1px solid var(--red)",
            }}
          >
            <div className="mb-4">
              <Typography component="span" className="font-semibold text-lg">
                Đề bài:{" "}
              </Typography>
              <span>{blockDetail?.question}</span>
            </div>
            <div className="mb-4">
              <Typography component="span" className="font-semibold text-lg">
                Mức độ:{" "}
              </Typography>
              <Chip
                style={{
                  backgroundColor: getColor(blockDetail?.level),
                }}
                label={
                  getLabel(blockDetail?.level)
                }
                sx={{
                  width: "fit-content",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              />
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Blockly Section */}
              <BlocklyLayout
                setDataBlocks={setDataBlocks}
                data={blockDetail?.data}
                isEdit={false}
              />
              {/* Image Section */}

              <div className="flex-1">
                {/* {blockDetail?.meta_data?.image && (
              
                )} */}
                <div
                  style={{
                    height: "50vh",
                    position: "relative",
                    borderRadius: "10px",
                  }}
                  className="bg-white rounded-lg shadow-inner flex items-center justify-center">
                  <img
                    src={blockDetail?.meta_data?.image || "/backgroundAuth.jpeg"}
                    alt="block detail"
                    class={blockDetail?.meta_data?.image ? "play-img" : "play-img cover"}
                  />
                  {/* absolute text "Hình minh họa"*/}
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
            </div>
            {currentQuestionIndex ===
              rows.findIndex((row) => row.block_id === blockDetail?.block_id) && (
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={rows[currentQuestionIndex].answered}
                  variant="contained"
                  sx={{ mt: 1 }}
                >
                  Kiểm tra
                </Button>
              )}
          </Box>
        </div>
      </div>
    </div>
  );
};
