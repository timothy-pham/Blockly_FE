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

let socket;

const CONNECTION_PORT = process.env.REACT_APP_API_URL;
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
      console.log("join room ============>");
      socket = io(CONNECTION_PORT);
      connectToRoom();
      hasFetched.current = true; // Ensure it only runs once
    }

    // return () => {
    //   socket.disconnect();
    // };
  }, []);

  useEffect(() => {
    console.log("user Joinnnnnnnnnnnn =====>");
    socket?.on("user_joined", (data) => {
      console.log("data", data);
      let temp = userList;
      temp.push(data);
      setUserList(temp);
    });
  });

  const connectToRoom = () => {
    setLoggedIn(true);
    socket.emit("join_room", { room_id: id, user_id: users.user_id });
  };

  const handleReady = () => {
    console.log("readyyyy");
    socket?.emit("user_ready", !ready);
    setReady(!ready);
  };

  console.log("userList ====>", userList);
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
                  <TableCell></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </>
  );
};
