/* eslint-disable no-undef */
import React, { useState, useEffect } from "react";
import RadialBar from "./RadialBar";
import ChatBubble from "./ChatBubble";

const Home = () => {
  const [mode, setMode] = useState("Productivity");
  const [timeData, setTimeData] = useState({
    Youtube: 0,
    Reading: 0,
    Coding: 0,
    Exercise: 0
  });
  const [totalTime, setTotalTime] = useState(0);
  const [chatMessages, setChatMessages] = useState([
    { message: "It's over Anakin, I have the high ground.", align: "end" },
    { message: "You underestimate my power!", align: "start" },
  ]);

  useEffect(() => {
    // Initial data fetch
    chrome.runtime.sendMessage({ type: 'getTimeData' }, (response) => {
      if (response) {
        setTimeData(response.categoryData);
        setTotalTime(response.totalTimeSpent);
      }
    });

    // Listen for updates
    const messageListener = (message) => {
      if (message.type === 'timeUpdate') {
        setTimeData(message.data);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  const handleToggle = (e) => {
    setMode(e.target.checked ? "Relax" : "Productivity");
  };

  // Convert timeData to progress data format
  const progressData = Object.entries(timeData).map(([label, time]) => ({
    value: Math.min(100, Math.round((time / (30 * 60 * 1000)) * 100)), // Calculate percentage (capped at 100%)
    label: label
  }));

  const handleSendMessage = (e) => {
    if (e.key === "Enter" && e.target.value.trim() !== "") {
      setChatMessages([
        ...chatMessages,
        { message: e.target.value, align: "start" },
      ]);
      e.target.value = "";
    }
  };

  // Calculate total progress percentage
  const totalProgress = Math.min(100, Math.round((totalTime / (2 * 60 * 60 * 1000)) * 100)); // Based on 2 hours target

  return (
    <div className="relative h-screen flex flex-col items-center">
      <p className="text-4xl mt-4 tracking-wide text-black text-center align-text-top italic font-playfair">
        kiddo
      </p>
      <p className="text-xs mt-4 text-purple-700">
        c'mon kid this is your dream.
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
          value={totalProgress}
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