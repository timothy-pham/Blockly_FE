import React, { useEffect, useLayoutEffect, useState } from "react";
import { apiGet } from "../../utils/dataProvider";
import { truncateText } from "../../utils/transform";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { SvgIcon, Typography } from "@mui/material";
import {
  QuestionMarkCircleIcon,
  BoltIcon,
  ClockIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/solid";

import "./lesson.css"
import moment from "moment";
export const Lessons = () => {
  const { id } = useParams();
  const info = localStorage.getItem("authToken");
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [statistics, setStatistics] = useState();
  const [histories, setHistories] = useState();
  const fetchCollection = async () => {
    try {
      const res = await apiGet(`groups/search?collection_id=${id}`);
      if (res) {
        const sortedRows = res.sort((a, b) => {
          if (a?.meta_data.position === undefined) return 1;
          if (b?.meta_data.position === undefined) return -1;
          return a?.meta_data.position - b?.meta_data.position;
        });

        setRows(sortedRows);
      }
      if (res) {
        setRows(res.sort((a, b) => a.created_at - b.created_at));
      }
    } catch (e) { }
  };

  const fetchStatistics = async () => {
    try {
      const res = await apiGet(`histories/statistics`);
      if (res) {
        setStatistics(res?.find((v) => v.collection_id == id).listGroup);
      }
    } catch (e) { }
  };

  const fetchHistories = async () => {
    try {
      const res = await apiGet(`histories/`);
      if (res) {
        setHistories(res);
      }
    } catch (e) { }
  }
  useEffect(() => {
    fetchCollection();
    fetchStatistics();
    fetchHistories();
  }, []);

  const checkStatistics = (group_id) => {
    if (statistics) {
      return statistics.find((v) => v.group_id == group_id);
    }
    return false;
  };

  const getHighestScoreData = (group_id) => {
    if (histories) {
      const list = histories.filter((v) => v?.group?.group_id == group_id);
      if (list.length > 0) {
        const highestScore = list.reduce((prev, current) => {
          return prev?.meta_data?.score > current?.meta_data?.score ? prev : current;
        })
        return highestScore?.meta_data;
      }
    }
    return null;
  }


  return (
    <div>
      <div class="ag-courses_box">
        {rows.map((val) => {
          const time = val?.total_blocks * 1 || 5;
          const highestScoreData = getHighestScoreData(val.group_id);
          let highestScore = 0;
          let timeString = "--:--"
          if (highestScoreData) {
            highestScore = highestScoreData?.score;
            const { start_time, end_time } = highestScoreData
            const totalTime = moment(end_time).diff(moment(start_time), 'seconds');
            timeString = moment.utc(totalTime * 1000).format('mm:ss')
          }
          return (<div
            class="ag-courses_item"
            key={val.group_id}
            onClick={() => {
              navigate(`/collections/${id}/groups/${val.group_id}`);
            }}
          >
            <a href="#" class="ag-courses-item_link">
              <div class="ag-courses-item_bg"></div>

              <div class="ag-courses-item_title">
                {val?.name}
              </div>

              <div class="ag-courses-item_date-box">
                <div class="flex justify-between ag-courses-item_date">
                  <div>
                    <div class="flex items-center">
                      <SvgIcon className="hover-icon">
                        <QuestionMarkCircleIcon />
                      </SvgIcon>
                      <p class="ag-courses-item_date ml-1">
                        Số câu hỏi: {val?.total_blocks}
                      </p>
                    </div>
                    <div class="flex mt-1">
                      <SvgIcon className="hover-icon">
                        <ClockIcon />
                      </SvgIcon>
                      <p class="ag-courses-item_date ml-1">
                        Trung bình: {time} phút
                      </p>
                    </div>
                  </div>
                  <div>
                    <div class="flex ">
                      <SvgIcon className="hover-icon">
                        <CheckBadgeIcon />
                      </SvgIcon>
                      <p class="ag-courses-item_date ml-1">
                        Điểm cao nhất: {highestScore}
                      </p>
                    </div>
                    <div class="flex mt-1">
                      <SvgIcon className="hover-icon">
                        <BoltIcon />
                      </SvgIcon>
                      <p class="ag-courses-item_date ml-1">
                        Thời gian: {timeString}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </a>
          </div>)
          return (
            <div
              className="relative group cursor-pointer"
              key={val.group_id}
              onClick={() => {
                navigate(`/collections/${id}/groups/${val.group_id}`);
              }}
            >
              <div
                className={`relative max-w-full flex flex-col items-center p-[25px] bg-slate-200 rounded-[25px] h-[100%] max-h-[500px] lg:group-hover:scale-105 transition-all duration-300`}
                style={{
                  backgroundImage: `url(${val?.meta_data?.image})`,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  borderWidth: checkStatistics(val.group_id) ? "5px" : "0px",
                  borderColor: "springgreen",
                }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-[25px]"></div>{" "}
                {/* Overlay */}
                <div className="relative w-full text-center">
                  <div className="text-white py-2 flex flex-wrap justify-between items-center">
                    <span className="text-lg font-bold">{val?.name}</span>
                  </div>
                  <div className="text-gray-200 [&>span]:text-xs lg:[&>span]:text-sm flex flex-wrap justify-between items-center break-all">
                    <span>{truncateText(val?.meta_data?.description)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
};
