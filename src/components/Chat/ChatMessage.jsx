// src/components/ChatMessage.js
import { Typography } from "@mui/material";
import React from "react";

// Utility function to get the initials of the name
const getInitials = (name) => {
  if (!name) return "";
  const names = name.split(" ");
  const initials = names.map((n) => n.charAt(0).toUpperCase());
  return initials.join("");
};

const ChatMessage = ({ message, isUser, avatar }) => {
  const initials = getInitials(message?.user?.name);
  console.log("message?.user", message?.user);

  // Check if the message is a special "has joined" message

  const renderAvatar = () => {
    if (avatar) {
      return (
        <img
          src={message?.user?.meta_data?.avatar}
          alt={initials}
          className="w-8 h-8 rounded-full  object-cover"
        />
      );
    } else {
      return (
        <div className="w-8 h-8 rounded-full  bg-gray-300 flex items-center justify-center text-white font-bold">
          {initials}
        </div>
      );
    }
  };

  const isJoinMessage = message[0]?.message?.includes("vừa tham gia");

  return isJoinMessage ? (
    <div className="flex justify-center mb-2">
      <div className="bg-gray-300 rounded-lg p-2 shadow max-w-sm text-center">
        {message[0]?.message}
      </div>
    </div>
  ) : (
    <div className={`flex items-center mb-2 ${isUser ? "justify-end" : ""}`}>
      {!isUser && renderAvatar()}
      <div
        className={`rounded-lg p-2 shadow mb-2 max-w-sm mx-2 ${
          isUser ? "bg-blue-500 text-white" : "bg-white"
        }`}
      >
        {message?.message}
      </div>
      {isUser && renderAvatar()}
    </div>
  );
};

export default ChatMessage;
