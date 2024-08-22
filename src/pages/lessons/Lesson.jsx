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

import "./lesson.css";
import moment from "moment";
export const Lessons = () => {
  const { id } = useParams();
  const info = localStorage.getItem("authToken");
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
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

  const fetchHistories = async () => {
    try {
      const res = await apiGet(`histories/`);
      if (res) {
        setHistories(res);
      }
    } catch (e) { }
  };
  useEffect(() => {
    fetchCollection();
    fetchHistories();
  }, []);

  const getHighestScoreData = (group_id) => {
    if (histories) {
      const list = histories.filter((v) => v?.group?.group_id == group_id);
      if (list.length > 0) {
        const highestScore = list.reduce((prev, current) => {
          return prev?.meta_data?.score > current?.meta_data?.score
            ? prev
            : current;
        });
        return highestScore?.meta_data;
      }
    }
    return null;
  };

  return (
    <div>
      <div className="ag-courses_box">
        {rows.map((val) => {
          const time = val?.total_blocks * 1.5 || 0;
          const highestScoreData = getHighestScoreData(val.group_id);
          let highestScore = 0;
          let timeString = "--:--";
          if (highestScoreData) {
            highestScore = highestScoreData?.score;
            const { start_time, end_time } = highestScoreData;
            const totalTime = moment(end_time).diff(
              moment(start_time),
              "seconds"
            );
            timeString = moment.utc(totalTime * 1000).format("mm:ss");
          }
          return (
            <div
              className="ag-courses_item"
              key={val.group_id}
              onClick={() => {
                navigate(`/collections/${id}/groups/${val?.group_id}`);
              }}
            >
              <a href="#" className="ag-courses-item_link">
                {highestScore > 0 ? (
                  <div className="ag-courses-item_bg active"></div>
                ) : (
                  <div className="ag-courses-item_bg"></div>
                )}
                <div className="ag-courses-item_title">{val?.name}</div>

                <div className="ag-courses-item_date-box">
                  <div className="flex justify-between ag-courses-item_date">
                    <div>
                      <div className="flex items-center">
                        <SvgIcon className="hover-icon">
                          <QuestionMarkCircleIcon />
                        </SvgIcon>
                        <p className="ag-courses-item_date ml-1">
                          Số câu hỏi: {val?.total_blocks}
                        </p>
                      </div>
                      <div className="flex mt-1">
                        <SvgIcon className="hover-icon">
                          <ClockIcon />
                        </SvgIcon>
                        <p className="ag-courses-item_date ml-1">
                          Trung bình: {time} phút
                        </p>
                      </div>
                    </div>
                    <div>
                      {highestScore > 0 && (
                        <>
                          <div className="flex ">
                            <SvgIcon className="hover-icon">
                              <CheckBadgeIcon />
                            </SvgIcon>
                            <p className="ag-courses-item_date ml-1">
                              Điểm cao nhất: {highestScore}
                            </p>
                          </div>
                          <div className="flex mt-1">
                            <SvgIcon className="hover-icon">
                              <BoltIcon />
                            </SvgIcon>
                            <p className="ag-courses-item_date ml-1">
                              Nhanh nhất: {timeString}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
};
