import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import io from "socket.io-client";
import {
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import { socket } from "../../socket";
import { fetchData } from "../../utils/dataProvider";
export const Waiting = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const info = localStorage.getItem("authToken");
  const { users } = JSON.parse(info);
  // Before Login
  const [loggedIn, setLoggedIn] = useState(false);
  const [room, setRoom] = useState("");
  const [ready, setReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetched = useRef(false);

  // After Login
  const [userList, setUserList] = useState([]);

  const fetchRoom = async () => {
    try {
      const res = await fetchData(`rooms/${id}`);
      if (res) {
        if (res.status === "waiting") {
          setIsLoading(false);
        } else {
          navigate("/rooms");
        }
        console.log("res ==========>", res);
      }
    } catch (e) {
      console.log("can not fetch history");
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      fetchRoom();
      connectToRoom();

      socket.on("disconnect", () => {
        console.log("Disconnected from server");
      });

      hasFetched.current = true; // Ensure it only runs once
    }
  });

  useEffect(() => {
    socket.on("user_joined", (data) => {
      userJoin(data);
    });

    socket.on("user_ready", (data) => {
      userReady(data);
    });

    socket.on("user_left", (data) => {
      userLeft(data);
    });

    return () => {
      socket.off("user_joined");
      socket.off("user_ready");
      socket.off("user_left");
    };
  }, [socket]);

  const userLeft = (data) => {
    setUserList((prevUserList) =>
      prevUserList.filter((v) => v.user_id !== data)
    );
  };

  const userJoin = (data) => {
    setUserList(data.users.filter((v) => v.is_connected));
  };

  const userReady = (data) => {
    setUserList(data.users.filter((v) => v.is_connected));
  };

  const connectToRoom = () => {
    setLoggedIn(true);
    socket.emit("join_room", { room_id: id, user_id: users.user_id });
  };

  const handleReady = () => {
    console.log("readyyyy", !ready);
    socket?.emit("user_ready", !ready);
    setReady(!ready);
  };

  return (
    <>
      <div className="flex  justify-between">
        <Button onClick={handleReady} variant="contained" sx={{ mt: 3, mb: 2 }}>
          {ready ? "ready" : "not ready"}
        </Button>
        <Button
          onClick={()=>{
            navigate()
          }}
          disabled={!userList.every((v) => v.is_ready)}
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Play
        </Button>
      </div>

      <div className="w-fullflex flex-col justify-center">
        <TableContainer sx={{ boxShadow: "none" }} component={Paper}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow className="[&>*]:font-bold">
                <TableCell>User</TableCell>
                <TableCell>Ready</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {userList.map((row, index) => (
                <TableRow key={index}>
                  <TableCell component="th" scope="row">
                    {row?.user_data.name}
                  </TableCell>
                  <TableCell>{row?.is_ready ? "ready" : "not ready"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </>
  );
};
