import React, { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import styles from "./styles.module.css";
import { useTransition, animated } from "@react-spring/web";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
const Ranking = ({ ranks, rows, onChangeUser }) => {
  let height = 0;
  const [sortedData, setSortedData] = useState([]);
  // const sortedData = ranks.sort((a, b) => b.score - a.score || b.end_timestamp - a.end_timestamp);

  useEffect(() => {
    const filterData = ranks.filter((rank) => rank.status === "playing" || rank.status === "finished");
    let sortedRanks = filterData.sort((a, b) => {
      if (a.score !== b.score) {
        return b.score - a.score;
      } else {
        return a.end_timestamp - b.end_timestamp;
      }
    });
    setSortedData(sortedRanks);
  }, [ranks]);

  const transitions = useTransition(
    sortedData.map((rank) => ({ ...rank, y: (height += 75) - 75 })),
    {
      key: (item) => item.user_id,
      from: { height: 0, opacity: 0 },
      leave: { height: 0, opacity: 0 },
      enter: ({ y }) => ({ y, height: 75, opacity: 1 }),
      update: ({ y }) => ({ y, height: 75 }),
    }
  );
  return (
    <div className="ms-3">
      <div className="flex flex-col items-center"
        style={{
          height: '50vh',
          borderRadius: 10,
          boxShadow: '0 0 10px 0 var(--red)',
        }}
      >
        <Typography variant="h5" className="py-2">Bảng xếp hạng</Typography>
        <div className={styles.list} style={{ height: sortedData.length * 75 }}>
          {transitions((style, item, t, index) => (
            <animated.div
              className={styles.card}
              style={{ zIndex: sortedData.length - index, ...style }}
            >
              <div className={styles.cell}
                onClick={() => {
                  onChangeUser && onChangeUser(item);
                }}
              >
                <div className={styles.details}>
                  <div className="flex items-center ">
                    <img
                      src={item?.user_data?.meta_data?.avatar ? item?.user_data?.meta_data?.avatar : "/default_avatar.png"}
                      className="w-8 h-8 rounded-full  object-cover mr-2"
                    />
                    <div>{item.user_data.name}</div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: 4,
                      }}
                    >
                      {item.status === "finished" && (
                        <div
                          sx={{
                            ml: 2,
                          }}
                        >
                          <CheckCircleOutlineIcon variant="outline" />
                        </div>
                      )}
                      <span style={{ display: "flex" }}>
                        {item.score}/{rows.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </animated.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Ranking;
