import React, { useState, useEffect } from "react";
import { fetchData } from "../utils/dataProvider";

export const RankingPage = () => {
  const [list, setList] = useState([]);

  const fetchRanking = async () => {
    try {
      const res = await fetchData("histories/ranking");
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
  }, []);

  const rankingUpdate = (data) => {
    const sortedRanks = data.sort((a, b) => {
      return b.points - a.points;
    });
    setList(sortedRanks);
  };

  console.log("list", list);

  return (
    <div style={{ width: "1000px", margin: "80px auto" }}>
      <div
        style={{
          width: "100%",
          height: "70px",
          background: "rgba(0, 168, 232, 0.79)",
          textAlign: "center",
          borderRadius: "5px 5px 0 0",
        }}
      >
        <h2 style={{ margin: "0", color: "#ffffff", paddingTop: "20px" }}>
          Bảng xếp hạng
        </h2>
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
        <div style={{ display: "inline-block", width: "55%" }}>
          <h4 style={{ fontSize: "15px" }}>Tên</h4>
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
          username={user?.name}
          rank={i + 1 || 1}
          points={user?.points}
          matches={user?.matches}
        />
      ))}
    </div>
  );
};

const User = ({ rank, username, points, matches }) => {
  const getInitials = (name) => {
    if (!name) return "";
    const names = name.split(" ");
    const initials = names.map((n) => n.charAt(0).toUpperCase());
    return initials.join("");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "nowrap",
        alignItems: "center",
        background: "rgba(254, 254, 254, 1)",
        width: "100%",
        height: "100%",
        padding: "5px",
        textAlign: "center",
        paddingBottom: "20px",
        paddingTop: "20px",
        border: "1px solid rgba(0,0,0,.2)",
      }}
    >
      <div style={{ paddingLeft: "6px", width: "12.5%" }}>
        <h4>{rank}</h4>
      </div>
      <div
        style={{
          width: "55%",
        }}
      >
        <a style={{ verticalAlign: "middle" }}>{username}</a>
      </div>

      <div style={{ width: "12.5%" }}>
        <h4>{points}</h4>
      </div>
      <div style={{ width: "20%" }}>
        <h4>{matches}</h4>
      </div>
    </div>
  );
};
