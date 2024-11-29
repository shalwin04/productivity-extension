/*global chrome*/
import React, { useState, useEffect, useRef } from "react";
import RadialBar from "./RadialBar";
import ChatBubble from "./ChatBubble";

const Home = () => {
  const [mode, setMode] = useState("Productivity");
  const [chatMessages, setChatMessages] = useState([
    { message: "Hi! I'll help you track your browsing time.", align: "end" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [radialData, setRadialData] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    // Establish connection with service worker
    const port = chrome.runtime.connect({ name: "popup" });
    fetchActiveTabs();
    // Listen for updates from service worker
    port.onMessage.addListener((message) => {
      if (message.action === "activityUpdate") {
        const formattedData = message.data.map((tab) => ({
          value: parseFloat(tab.totalActiveTime),
          label: tab.name,
        }));
        setRadialData(formattedData);
      }
    });

    // Request initial data
    port.postMessage({ action: "getTabActivity" });

    // Clean up connection when component unmounts
    return () => port.disconnect();
  }, []);

  // Rest of the component remains the same

  const handleToggle = (e) => {
    setMode(e.target.checked ? "Relax" : "Productivity");
  };

  const fetchActiveTabs = async () => {
    setIsLoading(true);
    try {
      if (typeof chrome !== "undefined" && chrome.runtime) {
        chrome.runtime.sendMessage({ action: "getTabActivity" }, (response) => {
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
            const activityData = response?.activityData || [];
            // Convert the activity data to the format expected by RadialBar
            const formattedData = activityData.map((tab) => ({
              value: parseFloat(tab.totalActiveTime), // Convert string to number if needed
              label: tab.name,
            }));
            setRadialData(formattedData);
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
      setChatMessages((prev) => [
        ...prev,
        { message: userMessage, align: "start" },
      ]);
      e.target.value = "";

      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          {
            message: `You're in ${mode} mode. Here's your current browsing activity.`,
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
        c'mon kid, this is your dream!
      </p>

      {/* Mode Toggle */}
      <div className="flex flex-none items-center mt-5 space-x-4">
        <span className="text-sm text-vintage-teal font-poppins">{mode}</span>
        <input
          type="checkbox"
          className="toggle toggle-md"
          onChange={handleToggle}
          checked={mode === "Relax"}
        />
      </div>

      {/* Radial Progress Bars */}
      <RadialBar data={radialData} />

      {/* Chat Interface */}
      <div className="relative bottom-0 left-0 w-full bg-white flex flex-col h-1/3 mt-auto">
        <div className="flex-grow overflow-y-auto space-y-4 p-4 bg-white">
          {chatMessages.map((chat, index) => (
            <ChatBubble key={index} message={chat.message} align={chat.align} />
          ))}
          <div ref={chatEndRef} />
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
