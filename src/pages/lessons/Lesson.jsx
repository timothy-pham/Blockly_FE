import React, { useEffect, useLayoutEffect, useState } from "react";
import { apiGet } from "../../utils/dataProvider";
import { truncateText } from "../../utils/transform";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Typography } from "@mui/material";

export const Lessons = () => {
  const { id } = useParams();
  const info = localStorage.getItem("authToken");
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [statistics, setStatistics] = useState();
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
    } catch (e) {}
  };

  const fetchStatistics = async () => {
    try {
      const res = await apiGet(`histories/statistics`);
      if (res) {
        setStatistics(res?.find((v) => v.collection_id == id).listGroup);
      }
    } catch (e) {}
  };
  useEffect(() => {
    fetchCollection();
    fetchStatistics();
  }, []);

  const checkStatistics = (group_id) => {
    if (statistics) {
      return statistics.find((v) => v.group_id == group_id);
    }
    return false;
  };
  return (
    <>
      <Typography variant="h6">Bài tập</Typography>

      <div className="border-t border-solid border-gray-300 pt-10 my-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {rows.map((val) => {
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
    </>
  );
};
