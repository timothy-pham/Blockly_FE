// src/components/ChatMessage.js
import React from "react";

const ChatMessage = ({ message, isUser }) => {
  return (
    <div className={`flex items-center mb-2 ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <img
          className="w-8 h-8 rounded-full mr-2"
          src={message.avatar}
          alt="User Avatar"
        />
      )}
      <div
        className={`rounded-lg p-2 shadow mb-2 max-w-sm ${
          isUser ? "bg-blue-500 text-white" : "bg-white"
        }`}
      >
        {message.text}
      </div>
      {isUser && (
        <img
          className="w-8 h-8 rounded-full ml-2"
          src={message.avatar}
          alt="User Avatar"
        />
      )}
    </div>
  );
};

export default ChatMessage;
