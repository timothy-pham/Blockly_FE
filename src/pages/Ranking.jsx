import React, { useState, useEffect } from "react";
import { apiGet } from "../utils/dataProvider";
import { Avatar } from "@mui/material";
import { formatDateTime, formatNumber } from "../utils/transform";
import "./styles/ranking.scss";
export const RankingPage = () => {
  const [list, setList] = useState([]);
  const [username, setUsername] = useState("");

  const fetchRanking = async () => {
    try {
      const res = await apiGet("histories/ranking");
      if (res) {
        rankingUpdate(res);
      }
    } catch (e) {
      console.log("can not fetch collection");
    }
  };
  useEffect(() => {
    fetchRanking();
    try {
      let usernameTemp = JSON.parse(localStorage.getItem("authToken"))?.user
        ?.username;
      setUsername(usernameTemp);
    } catch (error) {
      console.log("error", error);
    }
  }, []);

  const rankingUpdate = (data) => {
    let sortedRanks = data.sort((a, b) => {
      return b.points - a.points;
    });
    // // clone x4 to make the list longer
    // sortedRanks = sortedRanks.concat(sortedRanks);
    // sortedRanks = sortedRanks.concat(sortedRanks);
    // sortedRanks = sortedRanks.concat(sortedRanks);
    setList(sortedRanks);
  };

  return (
    <div className="rank-container">
      <div className="rank-table">
        <h1
          style={{
            textAlign: "center",
            fontSize: "30px",
            fontWeight: "bold",
            marginTop: "10px",
          }}
        >
          BẢNG XẾP HẠNG
        </h1>
        <div
          style={{
            width: "100%",
            fontWeight: "bold",
            textAlign: "center",
            borderRadius: "5px 5px 0 0",
          }}
        >
          <div
            style={{
              width: "100%",
              borderRadius: "5px 5px 0 0",
              marginBottom: "10px",
            }}
          >
            <h4>
              Hạng của bạn:{" "}
              {list.findIndex((user) => user.username === username) + 1 ||
                "Bạn chưa có hạng, hãy thi đấu 1 trận đi!"}
              {"\n"}
            </h4>
            <h4>
              Điểm tích lũy:{" "}
              {list.find((user) => user.username === username)?.points || 0}
              {"\n"}
            </h4>
            <h4>
              Tổng số trận đã đấu:{" "}
              {list.find((user) => user.username === username)?.matches || 0}
            </h4>
          </div>
        </div>
        <div className="rank-table__header">
          <div style={{ display: "inline-block", width: "2.5%" }}>
            <h4>Hạng</h4>
          </div>
          <div style={{ display: "inline-block", width: "10%" }}></div>
          <div style={{ display: "inline-block", width: "30%" }}>
            <h4>Họ và tên</h4>
          </div>
          <div style={{ display: "inline-block", width: "25%" }}>
            <h4>Tên người dùng</h4>
          </div>
          <div style={{ display: "inline-block", width: "12.5%" }}>
            <h4>Điểm tích lũy</h4>
          </div>
          <div style={{ display: "inline-block", width: "20%" }}>
            <h4>Tổng số trận đã đấu</h4>
          </div>
        </div>
        <div className="rank-table__body">
          {list?.map((user, i) => (
            <User
              key={user?.username}
              name={user?.name}
              rank={i + 1 || 0}
              points={user?.points}
              matches={user?.matches}
              username={user?.username}
              currentUser={username}
              userData={user?.meta_data}
            />
          ))}
        </div>
      </div>
      <GoTopButton />
      <div className="ranking-bg">
        <div className="arrow arrow--top">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="270.11"
            height="649.9"
            overflow="visible"
          >
            <g className="item-to bounce-1">
              <path
                className="geo-arrow draw-in"
                d="M135.06 142.564L267.995 275.5 135.06 408.434 2.125 275.499z"
              />
            </g>
            <circle
              className="geo-arrow item-to bounce-2"
              cx="194.65"
              cy="69.54"
              r="7.96"
            />
            <circle
              className="geo-arrow draw-in"
              cx="194.65"
              cy="39.5"
              r="7.96"
            />
            <circle
              className="geo-arrow item-to bounce-3"
              cx="194.65"
              cy="9.46"
              r="7.96"
            />
            <g className="geo-arrow item-to bounce-2">
              <path
                className="st0 draw-in"
                d="M181.21 619.5l13.27 27 13.27-27zM194.48 644.5v-552"
              />
            </g>
          </svg>
        </div>
        <div className="arrow arrow--bottom">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="31.35"
            height="649.9"
            overflow="visible"
          >
            <g className="item-to bounce-1">
              <circle
                className="geo-arrow item-to bounce-3"
                cx="15.5"
                cy="580.36"
                r="7.96"
              />
              <circle
                className="geo-arrow draw-in"
                cx="15.5"
                cy="610.4"
                r="7.96"
              />
              <circle
                className="geo-arrow item-to bounce-2"
                cx="15.5"
                cy="640.44"
                r="7.96"
              />
              <g className="item-to bounce-2">
                <path
                  className="geo-arrow draw-in"
                  d="M28.94 30.4l-13.26-27-13.27 27zM15.68 5.4v552"
                />
              </g>
            </g>
          </svg>
        </div>
        <div className="main">
          <div className="main__text-wrapper">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="dotted-circle"
              width="352"
              height="352"
              overflow="visible"
            >
              <circle
                cx="176"
                cy="176"
                r="174"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                strokeMiterlimit="10"
                strokeDasharray="12.921,11.9271"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

const GoTopButton = () => {
  const [visible, setVisible] = useState(false);

  const handleVisibleButton = () => {
    if (window.scrollY > 100) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleVisibleButton);
  }, []);

  return (
    <div>
      {visible && (
        <div
          className="go-top-button"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="icon icon-arrow-up"
          >
            <line x1="12" y1="19" x2="12" y2="5"></line>
            <polyline points="5 12 12 5 19 12"></polyline>
          </svg>
        </div>
      )}
    </div>
  );
};
const User = ({
  name,
  rank,
  username,
  points,
  matches,
  currentUser,
  userData,
}) => {
  const getInitials = (name) => {
    if (!name) return "";
    const names = name.split(" ");
    const initials = names.map((n) => n.charAt(0).toUpperCase());
    return initials.join("");
  };
  return (
    <div className="rank-table__row">
      <div
        style={{
          width: "2.5%",
        }}
      >
        <p className="font-bold">{rank}</p>
      </div>
      <div
        style={{
          width: "10%",
        }}
      >
        <img
          src={userData?.avatar ? userData?.avatar : "/default_avatar.png"}
          className="w-14 h-14 rounded-full ms-2 object-cover"
        />
      </div>
      <div
        style={{
          width: "30%",
        }}
      >
        <p
          style={{
            fontWeight: currentUser === username ? "1000" : "normal",
          }}
        >
          {name}
        </p>
      </div>
      <div
        style={{
          width: "25%",
        }}
      >
        <p>{username}</p>
      </div>
      <div style={{ width: "12.5%" }}>
        <p>{formatNumber(points)}</p>
      </div>
      <div style={{ width: "20%" }}>
        <p>{formatNumber(matches)}</p>
      </div>
    </div>
  );
};
