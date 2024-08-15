import React, { useEffect, useLayoutEffect, useState } from "react";
import { apiGet } from "../utils/dataProvider";
import { truncateText } from "../utils/transform";
import { useNavigate } from "react-router-dom";
import { Paper, Typography, SvgIcon } from "@mui/material";
import {
  QuestionMarkCircleIcon,
  BookOpenIcon
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
    <div class="paper">
      <div class="dashboard">
        {rows.map((val, idx) => {
          return (
            <div class="card">
              <div
                style={{
                  backgroundColor: "hsl(0, 0%, 13%)",
                  width: "100%",
                  height: "100%",
                  flex: 1,

                }}
              >
                <div className="flex items-center relative rounded w-full p-3">
                  <div className="book-3d relative w-full"
                  >
                    <img
                      className="rounded w-full"
                      src={val?.meta_data?.image}
                      alt={val?.name}
                    />
                  </div>
                </div>

                <div
                  style={{
                    width: "100%",
                    padding: 10,
                  }}

                >
                  <div className="text-black text-center">
                    <span
                      style={{
                        fontSize: 24,
                        fontWeight: "bold",
                        textAlign: "center",
                        display: "block",
                        textTransform: "uppercase",
                        fontFamily: '"Roboto", sans-serif',

                      }}
                      class="text"
                    >{val.name}</span>
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontFamily: '"Roboto", sans-serif',
                    }}
                  >
                    <div className="flex items-center">
                      <SvgIcon fontSize="small" >
                        <BookOpenIcon />
                      </SvgIcon>
                      <p className="font-bold ml-1">Tổng số bài: <span>{val?.total_groups}</span></p>
                    </div>
                    <div className="flex items-center">
                      <SvgIcon fontSize="small" >
                        <QuestionMarkCircleIcon />
                      </SvgIcon>
                      <p className="font-bold ml-1">Tổng số câu hỏi: <span>{val?.total_blocks}</span></p>
                    </div>

                  </div>

                  <p
                    style={{
                      fontSize: 16,
                      fontFamily: '"Roboto", sans-serif',
                      whiteSpace: "pre-line",
                      wordBreak: "break-word",
                      hyphens: "auto",
                      marginTop: 10,
                    }}
                    class="text"
                  >
                    {truncateText(val?.meta_data?.description, 250)}
                  </p>

                </div>
              </div>
              <div class="content"
                key={idx}
                onClick={() => {
                  if (val.type == "normal") {
                    navigate(`/collections/${val.collection_id}`);
                  } else {
                    navigate(
                      `/rooms?type=${val.type}&collection_id=${val.collection_id}`
                    );
                  }
                }}>
                <div class="contentBx">
                  {val.type == "normal" ?
                    (<section>
                      <div>
                        <button anim="glow" >BẮT ĐẦU LUYỆN TẬP</button>
                      </div>
                    </section>) :
                    (
                      <section>
                        <div>
                          <button anim="sheen" >THI ĐẤU NGAY</button>
                        </div>
                      </section>
                    )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>

  );
};
