import React, { useState, useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";

export const ChatBox = ({ messages, onSendMessage, userId, avatar }) => {
  const [newMessage, setNewMessage] = useState("");

  const scrollToBottom = () => {
    const chatBox = document.querySelector(".bg-gray-200");
    chatBox.scrollTop = chatBox.scrollHeight;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage("");
    }
  };

  return (
    <div className="flex flex-col ml-5 h-[500px]">
      <div
        className="bg-gray-200 flex-1 rounded-t-[20px] overflow-y-auto"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "var(--black) var(--gray-400)",
          height: "calc(100% - 60px)", // Adjust based on the height of the input and button
          color: "var(--black)",
        }}
      >
        <div className="px-4 py-2">
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message}
              isUser={message.user_id === userId}
              avatar={avatar}
            />
          ))}
        </div>
      </div>
      <div className="bg-gray-100 px-4 py-2 rounded-b-[20px]">
        <div className="flex items-center">
          <input
            className="w-full border rounded-full py-2 px-4 mr-2"
            style={{ color: "var(--black)" }}
            type="text"
            placeholder="Nhập tin nhắn..."
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
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
};
