import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  Table,
  TableBody,
  Paper,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { milisecondToSecondMinute } from "../../utils/transform";
export const EndGame = () => {
  const info = localStorage.getItem("authToken");
  const location = useLocation();
  const { user } = JSON.parse(info);
  const [allQuestions, setAllQuestions] = useState(0);
  const [ranks, setRanks] = useState([]);

  const rankingUpdate = (data) => {
    const sortedRanks = [...data.users].sort((a, b) => {
      if (a.score !== b.score) {
        return b.score - a.score;
      } else {
        return a.end_timestamp - b.end_timestamp;
      }
    });
    setAllQuestions(data?.meta_data?.blocks.length);
    setRanks(sortedRanks);
  };

  useEffect(() => {
    rankingUpdate(location?.state);
  }, []);

  return (
    <>
      <div className="flex-1">
        <div className="flex-col">
          <div>
            <Typography variant="h3">Bảng xếp hạng</Typography>
            <TableContainer sx={{ boxShadow: "none" }} component={Paper}>
              <Table aria-label="simple table">
                <TableHead>
                  <TableRow className="[&>*]:font-bold">
                    <TableCell>Hạng</TableCell>
                    <TableCell>Tên</TableCell>
                    <TableCell>Điểm </TableCell>
                    <TableCell>Thời gian làm </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ranks.map((row, index) => (
                    <TableRow>
                      <TableCell
                        component="th"
                        scope="row"
                        sx={
                          user.user_id == row.user_id && { fontWeight: "bold" }
                        }
                      >
                        {index + 1}
                      </TableCell>
                      <TableCell
                        sx={
                          user.user_id == row.user_id && { fontWeight: "bold" }
                        }
                      >
                        {row?.user_data.name}
                      </TableCell>
                      <TableCell
                        sx={
                          user.user_id == row.user_id && { fontWeight: "bold" }
                        }
                      >
                        {row?.score}/{allQuestions}
                      </TableCell>
                      <TableCell
                        sx={
                          user.user_id == row.user_id && { fontWeight: "bold" }
                        }
                      >
                        {milisecondToSecondMinute(row?.end_time)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </div>
      </div>
    </>
  );
};
