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
  const [tabData, setTabData] = useState([]);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);
  const portRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    if (typeof chrome === "undefined" || !chrome.runtime) {
      setError("Chrome extension API not available");
      return;
    }

    try {
      // Establish connection with service worker
      portRef.current = chrome.runtime.connect({ name: "popup" });

      // Set up message listener
      const messageListener = (message) => {
        if (message.action === "tabsUpdate") {
          const formattedData = formatTabData(message.data);
          setTabData(formattedData);
          setError(null);
        }
      };

      portRef.current.onMessage.addListener(messageListener);

      // Initial data fetch
      fetchTabData();

      // Set up periodic updates
      const intervalId = setInterval(fetchTabData, 1000);

      // Cleanup
      return () => {
        clearInterval(intervalId);
        if (portRef.current) {
          portRef.current.onMessage.removeListener(messageListener);
          portRef.current.disconnect();
        }
      };
    } catch (err) {
      console.error("Error setting up connection:", err);
      setError("Failed to connect to extension");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTabData = (data) => {
    return data
      .filter((tab) => tab.isOpen)
      .map((tab) => ({
        value: parseFloat(tab.totalTime),
        label: tab.hostname || "Unknown",
        fill: getRandomColor(),
      }))
      .sort((a, b) => b.value - a.value);
  };

  const fetchTabData = async () => {
    setIsLoading(true);
    try {
      chrome.runtime.sendMessage({ action: "getTabData" }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Chrome runtime error:", chrome.runtime.lastError);
          setError("Failed to fetch tab data");
          setChatMessages((prev) => [
            ...prev,
            {
              message:
                "Sorry, I couldn't fetch the tab times. Please try again.",
              align: "end",
            },
          ]);
        } else {
          const formattedData = formatTabData(response?.tabData || []);
          setTabData(formattedData);
          setError(null);
        }
      });
    } catch (error) {
      console.error("Error fetching tabs:", error);
      setError("Failed to fetch tab data");
    } finally {
      setIsLoading(false);
    }
  };

  const getRandomColor = () => {
    const colors = [
      "#8884d8",
      "#83a6ed",
      "#8dd1e1",
      "#82ca9d",
      "#a4de6c",
      "#d0ed57",
      "#ffc658",
      "#ff8042",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleToggle = (e) => {
    setMode(e.target.checked ? "Relax" : "Productivity");
  };

  const handleSendMessage = (e) => {
    if (e.key === "Enter" && e.target.value.trim() !== "") {
      const userMessage = e.target.value.trim();
      setChatMessages((prev) => [
        ...prev,
        { message: userMessage, align: "start" },
      ]);
      e.target.value = "";

      // Generate response based on current data
      const response = generateResponse(userMessage, tabData, mode);
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          { message: response, align: "end" },
        ]);
      }, 500);
    }
  };

  const generateResponse = (message, data, currentMode) => {
    const totalTime = data.reduce((sum, tab) => sum + tab.value, 0);
    const mostUsedSite = data[0]?.label || "no sites";

    if (message.toLowerCase().includes("time")) {
      return `You've spent ${formatTime(
        totalTime
      )} browsing today, mostly on ${mostUsedSite}.`;
    }
    if (message.toLowerCase().includes("mode")) {
      return `You're in ${currentMode} mode. This helps track your ${currentMode.toLowerCase()} time.`;
    }
    return `You're in ${currentMode} mode. Here's your current browsing activity.`;
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(" ");
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

      {/* Error Message */}
      {error && (
        <div className="w-full max-w-md mx-auto p-4 mb-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Radial Chart */}
      <div className="w-full max-w-xl p-4">
        <RadialBar
          width={400}
          height={300}
          cx={200}
          cy={150}
          innerRadius={20}
          outerRadius={140}
          barSize={20}
          data={tabData}
          label={{
            position: "insideStart",
            fill: "#fff",
            formatter: (entry) => `${entry.label}`,
          }}
        />
      </div>

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
