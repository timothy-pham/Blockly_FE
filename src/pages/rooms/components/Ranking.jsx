import React, { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import styles from "./styles.module.css";
import { useTransition, animated } from "@react-spring/web";

const Ranking = ({ ranks, rows }) => {
  let height = 0;
  const [sortedData, setSortedData] = useState([]);
  // const sortedData = ranks.sort((a, b) => b.score - a.score || b.end_timestamp - a.end_timestamp);

  useEffect(() => {
    console.log("RANKS");
    const sortedRanks = [...ranks].sort((a, b) => {
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
    <div className="flex flex-col items-center">
      <Typography variant="h4">Bảng xếp hạng</Typography>
      <div className={styles.list} style={{ height: sortedData.length * 75 }}>
        {transitions((style, item, t, index) => (
          <animated.div
            className={styles.card}
            style={{ zIndex: sortedData.length - index, ...style }}
          >
            <div className={styles.cell}>
              <div className={styles.details}>
                <div>{item.user_data.name}</div>
                <div>
                  {item.score}/{rows.length}
                </div>
              </div>
            </div>
          </animated.div>
        ))}
      </div>
    </div>
  );
};

export default Ranking;
