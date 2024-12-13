/*global chrome*/

// Store data for all tabs
let tabData = {};
const UPDATE_INTERVAL = 1000; // Update every second

// Initialize tab data structure
function initializeTabData(tabId, url) {
  if (!tabData[tabId]) {
    tabData[tabId] = {
      url: url,
      startTime: Date.now(),
      totalTime: 0,
      isOpen: true,
      hostname: getHostname(url),
    };
  }
}

// Get hostname from URL
function getHostname(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return "unknown";
  }
}

// Update timing for all open tabs
function updateAllTabs() {
  const currentTime = Date.now();

  // Update time for all open tabs
  Object.keys(tabData).forEach((tabId) => {
    if (tabData[tabId].isOpen) {
      const timeElapsed = currentTime - tabData[tabId].startTime;
      tabData[tabId].totalTime += timeElapsed;
      tabData[tabId].startTime = currentTime;
    }
  });

  // Broadcast updated data
  broadcastTabData();
}

// Format tab data for display
function getFormattedTabData() {
  return Object.entries(tabData).map(([tabId, data]) => ({
    tabId: tabId,
    url: data.url,
    hostname: data.hostname,
    totalTime: (data.totalTime / 1000).toFixed(2), // Convert to seconds
    isOpen: data.isOpen,
  }));
}

// Broadcast tab data to any listening components
function broadcastTabData() {
  chrome.runtime.sendMessage(
    {
      action: "tabsUpdate",
      data: getFormattedTabData(),
    },
    () => {
      if (chrome.runtime.lastError) {
        console.log("No receivers connected");
      }
    }
  );
}

// Start periodic updates
setInterval(updateAllTabs, UPDATE_INTERVAL);

// Track new tabs
chrome.tabs.onCreated.addListener((tab) => {
  initializeTabData(tab.id, tab.url);
});

// Track tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    if (!tabData[tabId]) {
      initializeTabData(tabId, tab.url);
    } else {
      tabData[tabId].url = tab.url;
      tabData[tabId].hostname = getHostname(tab.url);
    }
  }
});

// Track tab closures
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabData[tabId]) {
    tabData[tabId].isOpen = false;
    // Keep the data for history but mark as closed
  }
});

// Handle requests for tab data
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getTabData") {
    // Get all tabs to ensure our data is current
    chrome.tabs.query({}, (tabs) => {
      // Update our records for any tabs we might have missed
      tabs.forEach((tab) => {
        if (!tabData[tab.id]) {
          initializeTabData(tab.id, tab.url);
        }
      });

      sendResponse({
        tabData: getFormattedTabData(),
      });
    });
    return true; // Required for async response
  }
});

// Handle browser startup
chrome.runtime.onStartup.addListener(() => {
  // Clear old data and initialize for current tabs
  tabData = {};
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      initializeTabData(tab.id, tab.url);
    });
  });
});

// Optional: Save data periodically to chrome.storage
function saveDataToStorage() {
  chrome.storage.local.set({
    tabData: tabData,
  });
}

// Save data every minute
setInterval(saveDataToStorage, 60000);

// Load saved data on extension initialization
chrome.storage.local.get(["tabData"], (result) => {
  if (result.tabData) {
    tabData = result.tabData;
    // Verify all current tabs
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (!tabData[tab.id]) {
          initializeTabData(tab.id, tab.url);
        }
      });
    });
  }
});
