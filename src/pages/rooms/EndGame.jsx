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
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import { milisecondToSecondMinute } from "../../utils/transform";
export const EndGame = () => {
  const info = localStorage.getItem("authToken");
  const location = useLocation();
  const { user } = JSON.parse(info);
  const [allQuestions, setAllQuestions] = useState(0);
  const [ranks, setRanks] = useState([]);

  const rankingUpdate = (data) => {
    const sortedRanks = [...data?.users].sort((a, b) => {
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

  console.log("ranks ==========>", ranks, ranks[2]);

  return (
    <>
      <div className="flex-1">
        <h3>Bang xep hang</h3>
        <div className="flex justify-center">
          {/* Top 2 card*/}
          <Card sx={{ width: 345, height: 345, marginTop: 20, marginX: 5 }}>
            <CardMedia
              sx={{
                height: 150,
                aspectRatio: 1,
                objectFit: "contain",
                margin: "auto",
              }}
              component="img"
              image="/top2.png"
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                {ranks[1]?.user_data.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {`${ranks[1]?.score} / ${allQuestions}`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                +75 điểm
              </Typography>
            </CardContent>
          </Card>
          {/* Top 1 card*/}
          <Card sx={{ width: 345, height: 345, marginBottom: 20, marginX: 5 }}>
            <CardMedia
              sx={{
                height: 150,
                aspectRatio: 1,
                objectFit: "contain",
                margin: "auto",
              }}
              component="img"
              image="/top1.png"
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                {ranks[0]?.user_data.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {`${ranks[0]?.score} / ${allQuestions}`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                +100 điểm
              </Typography>
            </CardContent>
          </Card>
          {/* Top 3 card */}

          <Card sx={{ width: 345, height: 345, marginTop: 20, marginX: 5 }}>
            <CardMedia
              sx={{
                height: 150,
                aspectRatio: 1,
                objectFit: "contain",
                margin: "auto",
              }}
              component="img"
              image="/top3.png"
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                {ranks[2] ? ranks[2]?.user_data.name : "Không có đối thủ"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {ranks[2] && `${ranks[2]?.score} / ${allQuestions}`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {ranks[2] && "+50 điểm"}
              </Typography>
            </CardContent>
          </Card>
        </div>
        <div className="flex-col">
          <div>
            <Typography variant="h6">Chi tiết</Typography>
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
