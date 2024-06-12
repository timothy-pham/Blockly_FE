import React, { useState, useEffect } from "react";
import { fetchData } from "../utils/dataProvider";

export const RankingPage = () => {
  const [list, setList] = useState([]);
  const [username, setUsername] = useState("");
  console.log("username", username)
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
    try {
      let usernameTemp = JSON.parse(localStorage.getItem("authToken"))?.user?.username;
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

  console.log("list", list);

  return (
    <div style={{ width: "1000px", margin: "80px auto" }}>
      {/* your ranking */}
      <div
        style={{
          width: '100%',
          borderRadius: "5px 5px 0 0",
          marginBottom: "10px",
        }}
      >
        <h2>
          Hạng của bạn:{" "}{list.findIndex((user) => user.username === username) + 1 || 1}{"\n"}

        </h2>
        <h2>
          Điểm tích lũy:{" "}{list.find((user) => user.username === username)?.points || 0}{"\n"}

        </h2>
        <h2>
          Tổng số trận đã đấu:{" "}{list.find((user) => user.username === username)?.matches || 0}
        </h2>
      </div>
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
          name={user?.name}
          rank={i + 1 || 1}
          points={user?.points}
          matches={user?.matches}
          username={user?.username}
          currentUser={username}
        />
      ))}
    </div>
  );
};

const User = ({ name, rank, username, points, matches, currentUser }) => {
  console.log("🚀 ~ User ~ currentUser:", username, currentUser)
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
        background: currentUser === username ? "rgba(120, 168, 232, 0.79)" : "rgba(254, 254, 254, .9)",
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
        <a style={{ verticalAlign: "middle" }}>{name}</a>
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
