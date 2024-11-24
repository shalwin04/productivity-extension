import React, { useState } from "react";
import RadialBar from "./RadialBar";
import ChatBubble from "./ChatBubble";

const Home = () => {
  const [mode, setmode] = useState("Productivity");

  const [chatMessages, setChatMessages] = useState([
    { message: "It's over Anakin, I have the high ground.", align: "end" },
    { message: "You underestimate my power!", align: "start" },
  ]);

  const handleToggle = (e) => {
    setmode(e.target.checked ? "Relax" : "Productivity");
  };

  const progressData = [
    { value: 20, label: "Youtube" },
    { value: 50, label: "Reading" },
    { value: 75, label: "Coding" },
    { value: 40, label: "Exercise" },
  ];

  const handleSendMessage = (e) => {
    if (e.key === "Enter" && e.target.value.trim() !== "") {
      setChatMessages([
        ...chatMessages,
        { message: e.target.value, align: "start" },
      ]);
      e.target.value = "";
    }
  };

  return (
    <div className="relative h-screen flex flex-col items-center">
      <p className="text-3xl mt-4 text-title text-center align-text-top font-italic font-lora">
        productivity
      </p>
      <p className="mt-4 text-espresso">
        your personalized productivity & wellness bot
      </p>
      <div className="flex flex-none items-center mt-5 space-x-4">
        <div className="grid w-32">
          <span className="text-sm text-vintage-teal font-poppins">{mode}</span>
        </div>
        <div className="grid">
          <input
            type="checkbox"
            className="toggle toggle-md"
            onChange={handleToggle}
            defaultChecked={false}
          />
        </div>
      </div>
      <div className="flex flex-none items-center mt-10 space-x-4">
        <div className="grid w-32">
          <span className="text-sm text-vintage-teal font-poppins">
            Time Spent
          </span>
        </div>
        <progress
          className="grid progress progress-info w-32"
          value={0}
          max="100"
        ></progress>
      </div>
      <RadialBar data={progressData} />
      <div className="relative bottom-0 left-0 w-full bg-citrine-white flex flex-col h-1/2">
        <div className="flex-grow overflow-y-auto space-y-4 p-4 bg-citrine-white">
          {chatMessages.map((chat, index) => (
            <ChatBubble key={index} message={chat.message} align={chat.align} />
          ))}
        </div>
        <div className="p-4">
          <input
            className="border border-gray-300 bg-citrine-white rounded-full px-4 py-2 text-black w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ask me something..."
            onKeyDown={handleSendMessage}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
