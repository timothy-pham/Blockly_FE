import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Button, Chip, Typography } from "@mui/material";
import { transformCodeBlockly } from "../../../utils/transform";
import { createData, fetchData, updateData } from "../../../utils/dataProvider";
import { BlocklyLayout } from "../../../components/Blockly";
import moment from "moment";
import { toast } from "react-toastify";
import { toastOptions } from "../../../constant/toast";

export const LessonsDetail = () => {
  const { collection_id, group_id } = useParams();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [blockDetail, setBlockDetail] = useState();
  const [dataBlock, setDataBlocks] = useState();
  const [history, setHistory] = useState();
  const hasFetched = useRef(false);

  const createHistory = async (initialBlockDetail) => {
    try {
      const res = await createData(`histories`, {
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

  const fetchCollection = async () => {
    try {
      const res = await fetchData(`blocks/search?group_id=${group_id}`);
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
      fetchCollection();
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
      const res = await updateData(
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
    const res = await createData("blocks/check-answer", {
      id: blockDetail.block_id,
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
    }
  };

  return (
    <>
      <Typography variant="h4">Bài tập 1</Typography>
      <div className="border-b border-solid border-gray-300 pb-10 my-5">
        <Typography variant="subtitle1" sx={{ marginBottom: "10px" }}>
          Câu hỏi
        </Typography>

        <div className="flex gap-3 ">
          {rows.map((val, index) => (
            <Button
              variant="contained"
              disabled={index > 0 && !rows[index - 1].answered}
              className={` ${
                index === currentQuestionIndex ? "bg-slate-200" : ""
              }`}
              key={index}
              onClick={() => {
                setCurrentQuestionIndex(index);
                setBlockDetail(val);
              }}
            >
              <span className="">{val.name}</span>
            </Button>
          ))}
        </div>
      </div>
      <div>
        <Box>
          <div>
            <Typography component="span">Đề bài: </Typography>
            <span className="font-semibold">{blockDetail?.question}</span>
          </div>
          <div>
            <Typography component="span">Mức độ: </Typography>
            <Chip
              color={
                blockDetail?.level === 1
                  ? "success"
                  : blockDetail?.level === 2
                  ? "warning"
                  : "error"
              }
              label={
                blockDetail?.level === 1
                  ? "Dễ"
                  : blockDetail?.level === 2
                  ? "Bình thường"
                  : "Khó"
              }
              sx={{ width: "fit-content" }}
            />
          </div>

          <div className="my-2">
            <BlocklyLayout
              setDataBlocks={setDataBlocks}
              data={blockDetail?.data}
              isEdit={false}
            />
          </div>
          {currentQuestionIndex ===
            rows.findIndex((row) => row.block_id === blockDetail?.block_id) && (
            <Button
              onClick={handleSubmitAnswer}
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Kiểm tra
            </Button>
          )}
        </Box>
      </div>
    </>
  );
};
