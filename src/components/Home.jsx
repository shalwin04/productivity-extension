/*global chrome*/
import React, { useState, useEffect, useRef } from "react";
import RadialBar from "./RadialBar";
import ChatBubble from "./ChatBubble";

const Home = () => {
  const [mode, setMode] = useState("Productivity");
  const [chatMessages, setChatMessages] = useState([
    { message: "It's over Anakin, I have the high ground.", align: "end" },
    { message: "You underestimate my power!", align: "start" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  const [progressData, setProgressData] = useState([]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    fetchActiveTabs();
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleToggle = (e) => {
    setMode(e.target.checked ? "Relax" : "Productivity");
  };

  const fetchActiveTabs = async () => {
    setIsLoading(true);
    try {
      // Check if we're in a Chrome extension environment
      if (typeof chrome !== "undefined" && chrome.runtime) {
        chrome.runtime.sendMessage({ action: "getTabTimes" }, (response) => {
          if (chrome.runtime.lastError) {
            console.error("Chrome runtime error:", chrome.runtime.lastError);
            setChatMessages((prev) => [
              ...prev,
              {
                message:
                  "Sorry, I couldn't fetch the tab times. Please try again.",
                align: "end",
              },
            ]);
          } else {
            const tabTimes = response?.tabTimes || [];
            console.log("Tab Times:", tabTimes);

            // Map the tab times to progress data
            const updatedProgressData = tabTimes.map((tab) => ({
              value: Math.min(tab.timeSpent * 10, 100), // Scale minutes to fit 0-100 range
              label: tab.name,
            }));

            // Update the progress data
            setProgressData(updatedProgressData);
          }
        });
      }
    } catch (error) {
      console.error("Error fetching tabs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (e) => {
    if (e.key === "Enter" && e.target.value.trim() !== "") {
      const userMessage = e.target.value.trim();

      // Add user message
      setChatMessages((prev) => [
        ...prev,
        {
          message: userMessage,
          align: "start",
        },
      ]);

      // Clear input
      e.target.value = "";

      // Fetch tabs data

      // Add assistant response (you can modify this based on your needs)
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          {
            message: `You're in ${mode} mode. How can I help you?`,
            align: "end",
          },
        ]);
      }, 500);
    }
  };

  return (
    <div className="relative h-screen flex flex-col items-center bg-white">
      <p className="text-4xl mt-4 tracking-wide text-black text-center align-text-top italic font-playfair">
        kiddo
      </p>
      <p className="text-xs mt-4 text-purple-700">
        c'mon kid this is your dream.
      </p>

      {/* Mode Toggle */}
      <div className="flex flex-none items-center mt-5 space-x-4">
        <div className="grid w-32">
          <span className="text-sm text-vintage-teal font-poppins">{mode}</span>
        </div>
        <div className="grid">
          <input
            type="checkbox"
            className="toggle toggle-md"
            onChange={handleToggle}
            checked={mode === "Relax"}
          />
        </div>
      </div>

      {/* Progress Bar */}
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

      {/* Radial Bar Chart */}
      <RadialBar data={progressData} />

      {/* Chat Interface */}
      <div className="relative bottom-0 left-0 w-full bg-white flex flex-col h-1/2">
        <div className="flex-grow overflow-y-auto space-y-4 p-4 bg-white">
          {chatMessages.map((chat, index) => (
            <ChatBubble key={index} message={chat.message} align={chat.align} />
          ))}
          <div ref={chatEndRef} /> {/* Scroll anchor */}
        </div>

        {/* Chat Input */}
        <div className="p-4">
          <div className="relative">
            <input
              className="border border-gray-300 bg-citrine-white rounded-full px-4 py-2 text-black w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ask me something..."
              onKeyDown={handleSendMessage}
              disabled={isLoading}
            />
            {isLoading && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
