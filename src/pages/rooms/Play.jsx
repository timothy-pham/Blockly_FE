import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
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
export const Play = () => {
  const { id } = useParams();
  const info = localStorage.getItem("authToken");
  const { users } = JSON.parse(info);
  // Before Login
  const [loggedIn, setLoggedIn] = useState(false);
  const [room, setRoom] = useState("");
  const [ready, setReady] = useState(false);
  const hasFetched = useRef(false);

  // After Login
  const [userList, setUserList] = useState([]);

  useEffect(() => {
    if (!hasFetched.current) {

      connectToRoom();

      socket.on("disconnect", () => {
        console.log("Disconnected from server");
      });

      hasFetched.current = true; // Ensure it only runs once

    }
  });

  useEffect(() => {
    socket.on("user_joined", (data) => {
      console.log("User join:", data);
      userJoin(data);
    });

    socket.on("user_ready", (data) => {
      console.log("User ready:", data);
      userReady(data);
    })

    socket.on("user_left", (data) => {
      userLeft(data);
    });

    return () => {
      socket.off("user_joined");
      socket.off("user_ready");
      socket.off("user_left");
    }
  }, [])

  const userLeft = (data) => {
    console.log("User left:", data);
    const userIndex = userList.findIndex((user) => user.user_id === data);
    if (userIndex > -1) {
      console.log("User left:", data);
      userList.splice(userIndex, 1);
      setUserList([...userList]);
    }
  }

  const userJoin = (data) => {
    console.log("User joined:", data);
    // check if user already in the list
    const user = userList.find((user) => user.user_id === data.user_id);
    if (!user) {
      setUserList((prev) => [...prev, data])
    }
  }
  const userReady = (data) => {
    const user = userList.find((user) => user.user_id === data.user_id);
    if (user) {
      user.is_ready = data.is_ready;
      setUserList([...userList]);
    }
  }

  const connectToRoom = () => {
    setLoggedIn(true);
    socket.emit("join_room", { room_id: id, user_id: users.user_id });
  };

  const handleReady = () => {
    console.log("readyyyy");
    socket?.emit("user_ready", !ready);
    setReady(!ready);
  };

  return (
    <>
      <Button onClick={handleReady} variant="contained" sx={{ mt: 3, mb: 2 }}>
        {ready ? "ready" : "not ready"}
      </Button>

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
                    {row?.user_id}
                  </TableCell>
                  <TableCell>
                    {row?.is_ready}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </>
  );
};
