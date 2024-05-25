import React, { useEffect, useState } from "react";
import { fetchData } from "../../utils/dataProvider";
import { truncateText } from "../../utils/transform";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Typography } from "@mui/material";

export const Lessons = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const fetchCollection = async () => {
    try {
      const res = await fetchData(`groups/search?collection_id=${id}`);
      if (res) {
        setRows(res);
      }
    } catch (e) {}
  };
  useEffect(() => {
    fetchCollection();
  }, []);
  return (
    <>
      <Typography variant="h6">Bài tập</Typography>

      <div className="border-b border-solid border-gray-300 pb-10 my-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ">
          {rows.map((val) => {
            return (
              <div
                className={`relative group cursor-pointer`}
                key={val}
                onClick={() => {
                  navigate(`/collections/${id}/groups/${val.group_id}`);
                }}
              >
                <div className="max-w-full flex flex-col items-center p-[25px] bg-slate-700 rounded-[25px] h-[100%] max-h-[500px] lg:group-hover:scale-105  transition-all duration-300">
                  <div className="w-full">
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
    </>
  );
};
