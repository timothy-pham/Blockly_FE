import React, { useState, useEffect } from "react";
import { apiGet } from "../utils/dataProvider";
import { Avatar } from "@mui/material";
import { formatDateTime, formatNumber } from "../utils/transform";
import "./main.css";
export const RankingPage = () => {
  const [list, setList] = useState([]);
  const [username, setUsername] = useState("");

  const fetchRanking = async () => {
    try {
      const res = await apiGet("histories/ranking");
      console.log("res", res);
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
    const sortedRanks = data.sort((a, b) => {
      return b.points - a.points;
    });
    setList(sortedRanks);
  };

  return (
    <div style={{ width: "1000px", margin: "auto" }}>
      <div style={{
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        opacity: "0.3",
      }}>
        <div class="wrapper">
          <div><span class="dot"></span></div>
          <div><span class="dot"></span></div>
          <div><span class="dot"></span></div>
          <div><span class="dot"></span></div>
          <div><span class="dot"></span></div>
          <div><span class="dot"></span></div>
          <div><span class="dot"></span></div>
          <div><span class="dot"></span></div>
          <div><span class="dot"></span></div>
          <div><span class="dot"></span></div>
          <div><span class="dot"></span></div>
          <div><span class="dot"></span></div>
          <div><span class="dot"></span></div>
          <div><span class="dot"></span></div>
        </div>
      </div>
      {/* your ranking */}
      <h1 style={{
        textAlign: "center",
        fontSize: "30px",
        fontWeight: "bold",
      }}>BẢNG XẾP HẠNG</h1>
      <div
        style={{
          width: "100%",
          background: "rgba(0, 168, 232, 0.79)",
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
          <h2>
            Hạng của bạn:{" "}
            {list.findIndex((user) => user.username === username) + 1 || "Bạn chưa có hạng, hãy thi đấu 1 trận đi!"}
            {"\n"}
          </h2>
          <h2>
            Điểm tích lũy:{" "}
            {list.find((user) => user.username === username)?.points || 0}
            {"\n"}
          </h2>
          <h2>
            Tổng số trận đã đấu:{" "}
            {list.find((user) => user.username === username)?.matches || 0}
          </h2>
        </div>
      </div>
      <div
        style={{
          background: "rgba(254, 254, 254, .9)",
          width: "100%",
          marginLeft: "0",
          textAlign: "center",
          borderBottom: "1px solid rgba(0,0,0,.2)",
        }}
      >
        <div style={{ display: "inline-block", width: "12.5%" }}>
          <h4 style={{ fontSize: "15px" }}>Hạng</h4>
        </div>
        <div style={{ display: "inline-block", width: "30%" }}>
          <h4 style={{ fontSize: "15px" }}>Tên</h4>
        </div>
        <div style={{ display: "inline-block", width: "25%" }}>
          <h4 style={{ fontSize: "15px" }}>Tên người dùng</h4>
        </div>
        <div style={{ display: "inline-block", width: "12.5%" }}>
          <h4
            style={{ fontSize: "15px", cursor: "pointer", userSelect: "none" }}
          >
            Điểm tích lũy
          </h4>
        </div>
        <div style={{ display: "inline-block", width: "20%" }}>
          <h4
            style={{ fontSize: "15px", cursor: "pointer", userSelect: "none" }}
          >
            Tổng số trận đã đấu
          </h4>
        </div>
      </div>
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
  const getColor = () => {
    switch (rank) {
      case 1:
        return "#FFD700";
      case 2:
        return "#C0C0C0";
      case 3:
        return "#cd7f32";
      default:
        return "rgba(254, 254, 254, .9)";
    }
  }
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "nowrap",
        alignItems: "center",
        background: getColor(),
        width: "100%",
        height: "100%",
        padding: "5px",
        textAlign: "center",
        paddingBottom: "10px",
        paddingTop: "10px",
        border: "1px solid rgba(0,0,0,.2)",
      }}
    >
      <div
        style={{
          paddingLeft: "6px",
          width: "12.5%",
          display: "flex",
          flexDirection: "row",
          flexWrap: "nowrap",
          alignItems: "center",
        }}
      >
        <h4>{rank}</h4>
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
        <a style={{
          verticalAlign: "middle",
          fontWeight: currentUser === username ? "1000" : "normal ",
        }}>{name}</a>
      </div>
      <div
        style={{
          width: "25%",
        }}
      >
        <a style={{ verticalAlign: "middle" }}>{username}</a>
      </div>
      <div style={{ width: "12.5%" }}>
        <h4>{formatNumber(points)}</h4>
      </div>
      <div style={{ width: "20%" }}>
        <h4>{formatNumber(matches)}</h4>
      </div>
    </div>
  );
};
