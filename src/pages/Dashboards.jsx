import React, { useEffect, useState } from "react";
import { fetchData } from "../utils/dataProvider";
import { truncateText } from "../utils/transform";
import { useNavigate } from "react-router-dom";
import { Paper, Typography } from "@mui/material";
export const Dashboard = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);

  const fetchCollection = async () => {
    try {
      const res = await fetchData("collections");
      if (res) {
        setRows(res);
      }
    } catch (e) {}
  };
  useEffect(() => {
    fetchCollection();
  }, []);
  return (
    <Paper sx={{ padding: 3 }}>
      <Typography variant="h6">Chủ đề</Typography>

      <div className="border-b border-solid border-gray-300 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {rows.map((val) => {
            return (
              <div
                className="relative group cursor-pointer"
                key={val}
                onClick={() => {
                  if (val.type == "normal") {
                    navigate(`/collections/${val.collection_id}`);
                  } else {
                    navigate(
                      `/rooms?type=${val.type}&collection_id=${val.collection_id}`
                    );
                  }
                }}
              >
                <div className="max-w-full flex flex-col items-center bg-slate-200 rounded-[25px] h-[100%] max-h-[500px] lg:group-hover:scale-105 transition-all duration-300">
                  <div className="flex items-center relative rounded w-full">
                    <div className="book-3d relative w-full h-[270px]">
                      <img
                        className="object-cover w-full h-full align-middle rounded-t-[25px]"
                        src={val?.meta_data?.image}
                        alt="Product"
                      />
                    </div>
                  </div>

                  <div className="mt-3 w-full p-2">
                    <div className="text-black py-2 flex flex-wrap justify-between items-center">
                      <span>{val.name}</span>
                    </div>
                    <div className="text-gray-400 [&>span]:text-xs lg:[&>span]:text-sm flex flex-wrap justify-between items-center break-all">
                      <span>{truncateText(val.meta_data.description)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Paper>
  );
};
