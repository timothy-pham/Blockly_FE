import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Button, Chip, Typography } from "@mui/material";
import { transformCodeBlockly, truncateText } from "../../../utils/transform";
import {
  createData,
  fetchData,
  fetchDataDetail,
} from "../../../utils/dataProvider";
import { BlocklyLayout } from "../../../components/Blockly";

export const LessonsDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const id = location?.pathname?.split("/")[2];
  const [rows, setRows] = useState([]);
  const [blockDetail, setBlockDetail] = useState();
  const [dataBlock, setDataBlocks] = useState();

  const fetchCollection = async () => {
    try {
      const res = await fetchData(`blocks/search?group_id=${id}`);
      if (res) {
        setRows(res);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchCollection();
  }, []);

  const handleSubmitAnswer = async () => {
    await createData("blocks/check-answer", {
      id: blockDetail.block_id,
      answers: transformCodeBlockly(dataBlock.code),
    });
  };

  return (
    <>
      <Typography variant="h4">Bài tập 1</Typography>
      <div className="border-b border-solid border-gray-300 pb-10 my-5">
        <Typography variant="subtitle1" sx={{ marginBottom: "10px" }}>
          Câu hỏi
        </Typography>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 ">
          {rows.map((val, index) => {
            return (
              <div
                className={`relative group cursor-pointer`}
                key={index}
                onClick={() => {
                  // console.log(val);
                  setBlockDetail(val);
                  // fetchBlockData(val.block_id);
                }}
              >
                <div className="w-36 flex flex-col items-center p-[5px] bg-slate-700 rounded-[25px]  lg:group-hover:scale-105  transition-all duration-300">
                  <div className="text-black py-2 flex flex-wrap justify-between items-center ">
                    <span className="text-white">{val.name}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {blockDetail && (
        <Box>
          <div>
            <Typography component="span">Đề bài: </Typography>
            <span className="font-semibold">{blockDetail?.question}</span>
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
          <Button
            onClick={handleSubmitAnswer}
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Kiểm tra
          </Button>
        </Box>
      )}
    </>
  );
};
