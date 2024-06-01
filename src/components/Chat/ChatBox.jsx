// src/components/ChatWindow.js
import React, { useState } from "react";
import ChatMessage from "./ChatMessage";

export const ChatBox = ({ messages, onSendMessage, userId }) => {
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage("");
    }
  };

  return (
    <div className="flex flex-col flex-1 ml-5 h-[300px]">
      <div className="bg-gray-200 flex-1 overflow-y-scroll">
        <div className="px-4 py-2">
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message}
              isUser={message.user_id == userId}
            />
          ))}
        </div>
      </div>
      <div className="bg-gray-100 px-4 py-2">
        <div className="flex items-center">
          <input
            className="w-full border rounded-full py-2 px-4 mr-2"
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
          />
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-full"
            onClick={handleSendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
