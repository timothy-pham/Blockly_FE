import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Button, Chip, Typography } from "@mui/material";
import { transformCodeBlockly } from "../../../utils/transform";
import {
  createData,
  fetchData,
  fetchDataDetail,
  updateData,
} from "../../../utils/dataProvider";
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
  const [groupDetail, setGroupDetail] = useState();
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

  const fetchGroupDetail = async () => {
    try {
      const res = await fetchDataDetail("groups", group_id);
      if (res) {
        setGroupDetail(res);
      }
    } catch (e) {
      console.log("can not fetch collection");
    }
  };

  const fetchBlock = async () => {
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
      <Typography variant="h4" className="text-3xl font-bold mb-6">
        {groupDetail?.name}
      </Typography>
      <div className="border-b border-solid border-gray-300 pb-10 my-5">
        <Typography variant="subtitle1" className="text-lg mb-4">
          Câu hỏi
        </Typography>

        <div className="flex gap-3 flex-wrap">
          {rows.map((val, index) => (
            <Button
              variant="contained"
              disabled={index > 0 && !rows[index - 1].answered}
              className={`${
                index === currentQuestionIndex
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

      <div className="bg-gray-100 p-5 rounded-lg shadow-lg">
        <Box className="p-5 bg-white rounded-lg shadow-sm">
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

            <div className="flex-1 ">
              <Typography component="span" className="font-semibold text-lg">
                Hình ảnh:{" "}
              </Typography>{" "}
              {blockDetail?.meta_data?.image && (
                <div className="max-h-[400px] p-3 bg-white rounded-lg shadow-inner flex items-center justify-center">
                  <img
                    src={blockDetail?.meta_data?.image}
                    alt="block detail"
                    className="w-full max-h-[400px] object-contain rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>
          {currentQuestionIndex ===
            rows.findIndex((row) => row.block_id === blockDetail?.block_id) && (
            <Button
              onClick={handleSubmitAnswer}
              variant="contained"
              sx={{ mt: 1 }}
            >
              Kiểm tra
            </Button>
          )}
        </Box>
      </div>
    </>
  );
};
