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

const ChatMessage = ({ message, isUser }) => {
  const initials = getInitials(message?.user?.name);

  // Check if the message is a special "has joined" message

  const isJoinMessage = message[0]?.message?.includes("has joined");

  return isJoinMessage ? (
    <div className="flex justify-center mb-2">
      <div className="bg-gray-300 rounded-lg p-2 shadow max-w-sm text-center">
        {message[0]?.message}
      </div>
    </div>
  ) : (
    <div className={`flex items-center mb-2 ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full mr-2 bg-gray-300 flex items-center justify-center text-white font-bold">
          {initials}
        </div>
      )}
      <div
        className={`rounded-lg p-2 shadow mb-2 max-w-sm ${
          isUser ? "bg-blue-500 text-white" : "bg-white"
        }`}
      >
        {message?.message}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full ml-2 bg-gray-300 flex items-center justify-center text-white font-bold">
          {initials}
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
