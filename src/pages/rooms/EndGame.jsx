import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  Table,
  TableBody,
  Paper,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import { milisecondToSecondMinute } from "../../utils/transform";
import { apiGetDetail } from "../../utils/dataProvider";
export const EndGame = () => {
  const navigate = useNavigate();
  const info = localStorage.getItem("authToken");
  const location = useLocation();
  const { user } = JSON.parse(info);
  const [allQuestions, setAllQuestions] = useState(0);
  const [ranks, setRanks] = useState([]);
  const { id } = useParams();
  const fetchRoomData = async () => {
    try {
      const res = await apiGetDetail("rooms", id);
      if (res) {
        rankingUpdate(res);
      }
    } catch (e) {
      console.log("can not fetch rooms");
      console.log(e)
    }
  };

  const rankingUpdate = (data) => {
    const sortedRanks = [...data?.users].sort((a, b) => {
      if (a.score !== b.score) {
        return b.score - a.score;
      } else {
        return a.end_timestamp - b.end_timestamp;
      }
    });

    const filterRanks = sortedRanks.filter((rank) => rank.is_ready);

    setAllQuestions(
      data?.meta_data?.count
        ? data?.meta_data?.count
        : data?.meta_data?.blocks.length
    );
    setRanks(filterRanks);
  };

  useEffect(() => {
    if (location.state) {
      rankingUpdate(location.state);
    } else {
      fetchRoomData();
    }
  }, []);

  const getName = (name) => {
    if (!name) return "";
    const names = name.split(" ");
    const initials = names.map((n) => n.charAt(0).toUpperCase());
    return initials.join("");
  };

  return (
    <div class="container-body">
      <div className="flex-1">
        <div className="flex justify-center">
          {/* Top 2 card*/}
          <Card sx={{
            width: 345, height: 345, marginTop: 20, marginX: 5,
            borderRadius: "50%",
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "var(--red)"
          }}>
            <CardMedia
              sx={{
                height: 150,
                aspectRatio: 1,
                objectFit: "contain !important",
              }}
              component="img"
              image="/top2.png"
            />
            <CardContent sx={{
              textAlign: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: "1.5rem",
            }}>
              <div gutterBottom variant="h5" component="div">
                {ranks[1]?.user_data.name}
              </div>
              <div variant="body2" color="text.secondary">
                {`${ranks[1]?.score} / ${allQuestions}`}
              </div>
              <div variant="body2" color="text.secondary">
                {`${ranks[1]?.score > 0 ? "+75 điểm" : ""}`}
              </div>
            </CardContent>
          </Card>
          {/* Top 1 card*/}
          <Card sx={{
            width: 345, height: 345, marginBottom: 20, marginX: 5,
            borderRadius: "50%",
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "var(--red)"
          }}>
            <CardMedia
              sx={{
                height: 150,
                aspectRatio: 1,
                objectFit: "contain !important",
              }}
              component="img"
              image="/top1.png"
            />
            <CardContent
              sx={{
                textAlign: "center",
                color: "white",
                fontWeight: "bold",
                fontSize: "1.5rem",

              }}
            >
              <div gutterBottom variant="h5" component="div">
                {ranks[0]?.user_data.name}
              </div>
              <div variant="body2" color="text.secondary">
                {`${ranks[0]?.score} / ${allQuestions}`}
              </div>
              <div variant="body2" color="text.secondary">
                {`${ranks[0]?.score > 0 ? "+100 điểm" : ""}`}
              </div>
            </CardContent>
          </Card>
          {/* Top 3 card */}

          <Card sx={{
            width: 345, height: 345, marginTop: 20, marginX: 5,
            borderRadius: "50%",
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "var(--red)"
          }}>
            <CardMedia
              sx={{
                height: 150,
                aspectRatio: 1,
                objectFit: "contain !important",
              }}
              component="img"
              image="/top3.png"
            />
            <CardContent
              sx={{
                textAlign: "center",
                color: "white",
                fontWeight: "bold",
                fontSize: "1.5rem",
              }}
            >
              <div gutterBottom variant="h5" component="div">
                {ranks[2] ? ranks[2]?.user_data.name : "Không có đối thủ"}
              </div>
              <div variant="body2" color="text.secondary">
                {ranks[2] && `${ranks[2]?.score} / ${allQuestions}`}
              </div>
              <div variant="body2" color="text.secondary">
                {`${ranks[2]?.score > 0 ? "+75 điểm" : ""}`}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex-col">
          <div className="flex justify-center">
            <TableContainer sx={{
              width: "80%",
              boxShadow: "none", marginTop: "20px",
              "& > *": {
                backgroundColor: "var(--black)",
                color: "var(--white)",
              },
              // tableCell style
              "& .MuiTableCell-root": {
                color: "white",
                borderBottom: "1px solid var(--red)",
              },
            }} component={Paper}>
              <Table aria-label="simple table">
                <TableHead>
                  <TableRow className="[&>*]:font-bold">
                    <TableCell>Hạng</TableCell>
                    <TableCell>Tên</TableCell>
                    <TableCell>Điểm </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ranks.map((row, index) => (
                    <TableRow
                      key={index}
                    >
                      <TableCell
                        component="th"
                        scope="row"
                        style={{ fontWeight: user.user_id == row.user_id ? "bold" : "normal" }}
                      >
                        {index + 1}
                      </TableCell>
                      <TableCell
                        style={{ fontWeight: user.user_id == row.user_id ? "bold" : "normal" }}
                      >
                        <div className="flex items-center ">
                          {row?.user_data?.meta_data?.avatar ? (
                            <img
                              src={row?.user_data?.meta_data?.avatar}
                              className="w-8 h-8 rounded-full  object-cover mr-2"
                            />
                          ) : (
                            <div
                              style={{ backgroundColor: "#1976d2" }}
                              className="w-8 h-8 rounded-full mr-2 flex items-center justify-center text-white font-bold  focus:ring-2 focus:ring-sky-600"
                            >
                              {getName(row?.user_data.name)}
                            </div>
                          )}
                          <div>{row?.user_data.name}</div>
                        </div>
                      </TableCell>
                      <TableCell
                        style={{ fontWeight: user.user_id == row.user_id ? "bold" : "normal" }}
                      >
                        {row?.score}/{allQuestions}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
