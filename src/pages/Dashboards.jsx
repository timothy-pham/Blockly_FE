import React, { useEffect, useLayoutEffect, useState } from "react";
import { apiGet } from "../utils/dataProvider";
import { truncateText } from "../utils/transform";
import { useNavigate } from "react-router-dom";
import { Paper, Typography, SvgIcon } from "@mui/material";
import {
  QuestionMarkCircleIcon,
  BookOpenIcon,
} from "@heroicons/react/24/solid";

// import css
import "./styles/dashboard.css";
export const Dashboard = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);

  const fetchCollection = async () => {
    try {
      const res = await apiGet("collections");
      if (res) {
        setRows(res);
      }
    } catch (e) { }
  };
  useLayoutEffect(() => {
    fetchCollection();
  }, []);

  return (
    <div>
      <div
        class="relative flex h-[calc(100vh)]
          cursor-pointer
       "
        style={{
          fontFamily: "Courier New,'Courier','monospace'",
          fontSize: "1.5rem",
        }}
      >
        {rows.map((val, idx) => {
          const { type } = val;
          if (type === "normal") {
            return (
              <div
                class="absolute h-full w-full 
              transition-all duration-300 ease-in-out
               shadow-[inset_0_0_0_2000px_hsl(12,90%,63%,0.8)] hover:shadow-[hsl(12,90%,63%)]
                [clip-path:polygon(0_0,30%_0,70%_100%,0%_100%)] object-contain
          "
                style={{
                  backgroundImage: `url(${val?.meta_data?.image})`,
                  backgroundSize: " cover",
                }}
                onClick={() => {
                  navigate(`/collections/${val.collection_id}`);
                }}
              >
                <div>
                  <div class="text-center space-y-4 text-[#333] w-[calc(50%-40px)] flex-1 flex flex-col absolute top-1/2 px-4 -translate-y-1/2">
                    <p className="font-bold text-5xl">{val.name}</p>

                    <p className="font-bold">
                      Tổng số bài: <span>{val?.total_groups}</span>
                    </p>
                    <p className="font-bold">
                      Tổng số câu hỏi: <span>{val?.total_blocks}</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          }
          return (
            <div
              class="absolute h-full w-full 
               transition-all duration-300 ease-in-out
          [clip-path:polygon(100%_0,100%_100%,70%_100%,30%_0)]
           shadow-[inset_0_0_0_2000px_rgb(51,51,51,0.8)] hover:shadow-[rgb(51,51,51)]
          "
              style={{
                backgroundImage: `url(${val?.meta_data?.image})`,
                backgroundSize: " cover",
              }}
              onClick={() => {
                navigate(
                  `/rooms?type=${val.type}&collection_id=${val.collection_id}`
                );
              }}
            >
              <div>
                <div class="space-y-4  text-center right-0 text-[hsl(12,90%,63%)] w-[calc(50%-120px)] flex-1 flex flex-col absolute top-1/2 px-4 -translate-y-1/2">
                  <p className="font-bold text-5xl">{val.name}</p>

                  <p className="font-bold">
                    Tổng số bài: <span>{val?.total_groups}</span>
                  </p>
                  <p className="font-bold">
                    Tổng số câu hỏi: <span>{val?.total_blocks}</span>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
