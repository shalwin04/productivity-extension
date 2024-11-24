import React from "react";

const ChatBubble = ({ message, align = "start" }) => {
  return (
    <div className={`chat chat-${align}`}>
      <div className="chat-bubble">{message}</div>
    </div>
  );
};

export default ChatBubble;
