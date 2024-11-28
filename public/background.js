/*global chrome*/

let activeTabId = null;
let lastActiveTime = Date.now();
let tabActivityData = {}; // Store activity data for each tab
let activeThreshold = 5000; // 5 seconds threshold to consider a tab "active"
let inactivityTimer = null;
const UPDATE_INTERVAL = 30000; // 30 seconds in milliseconds

// Initialize periodic updates
setInterval(() => {
  updateAllTabs();
}, UPDATE_INTERVAL);

// Function to update all tabs
function updateAllTabs() {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tabActivityData[tab.id] && tabActivityData[tab.id].isActive) {
        const currentTime = Date.now();
        const tabData = tabActivityData[tab.id];

        // Update total active time for active tabs
        if (tabData.lastActiveStart) {
          tabData.totalActiveTime += currentTime - tabData.lastActiveStart;
          tabData.lastActiveStart = currentTime;
        }
      }
    });

    // Only try to broadcast if there are any connections
    chrome.runtime.sendMessage(
      {
        action: "activityUpdate",
        data: getFormattedActivityData(tabs),
      },
      // Add response callback to handle potential errors
      () => {
        if (chrome.runtime.lastError) {
          // Ignore the error - this just means no listeners are connected
          console.log("No receivers for activity update");
        }
      }
    );
  });
}

// Helper function to format activity data
function getFormattedActivityData(tabs) {
  return tabs.map((tab) => {
    const data = tabActivityData[tab.id] || {
      totalActiveTime: 0,
      activityCount: 0,
      isActive: false,
    };

    let currentActiveTime = 0;
    if (data.isActive && data.lastActiveStart) {
      currentActiveTime = Date.now() - data.lastActiveStart;
    }

    try {
      const hostname = tab.url ? new URL(tab.url).hostname : "unknown";
      const domainName = hostname.split(".").slice(-2).join(".");

      return {
        name: domainName,
        url: tab.url,
        totalActiveTime: (
          (data.totalActiveTime + currentActiveTime) /
          60000
        ).toFixed(2),
        activityCount: data.activityCount,
        isCurrentlyActive: data.isActive,
        lastInteraction: data.lastInteraction
          ? new Date(data.lastInteraction).toLocaleString()
          : "Never",
      };
    } catch (error) {
      console.error("Error processing tab data:", error);
      return {
        name: "Unknown Site",
        url: tab.url,
        totalActiveTime: "0.00",
        activityCount: 0,
        isCurrentlyActive: false,
        lastInteraction: "Never",
      };
    }
  });
}

// Initialize or reset a tab's activity data
function initTabActivity(tabId) {
  if (!tabActivityData[tabId]) {
    tabActivityData[tabId] = {
      totalActiveTime: 0,
      lastActiveStart: null,
      isActive: false,
      activityCount: 0,
      url: null,
      lastInteraction: null,
    };
  }
}

// Update activity status for a tab
function updateTabActivity(tabId, isActive = true) {
  if (!tabActivityData[tabId]) {
    initTabActivity(tabId);
  }

  const currentTime = Date.now();
  const tabData = tabActivityData[tabId];

  if (isActive && !tabData.isActive) {
    tabData.isActive = true;
    tabData.lastActiveStart = currentTime;
    tabData.activityCount++;
    tabData.lastInteraction = currentTime;
  } else if (!isActive && tabData.isActive) {
    tabData.isActive = false;
    if (tabData.lastActiveStart) {
      tabData.totalActiveTime += currentTime - tabData.lastActiveStart;
    }
    tabData.lastActiveStart = null;
  }
}

// Handle user interactions
function handleUserInteraction(tabId) {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }

  updateTabActivity(tabId, true);

  inactivityTimer = setTimeout(() => {
    updateTabActivity(tabId, false);
  }, activeThreshold);
}

// Listen for tab activations
chrome.tabs.onActivated.addListener((activeInfo) => {
  const tabId = activeInfo.tabId;
  activeTabId = tabId;
  handleUserInteraction(tabId);

  chrome.tabs.get(tabId, (tab) => {
    if (tab && tab.url) {
      if (!tabActivityData[tabId]) {
        initTabActivity(tabId);
      }
      tabActivityData[tabId].url = tab.url;
    }
  });
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.active && changeInfo.status === "complete") {
    if (tabActivityData[tabId]) {
      tabActivityData[tabId].url = tab.url;
    }
    handleUserInteraction(tabId);
  }
});

// Track window focus changes
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    if (activeTabId) {
      updateTabActivity(activeTabId, false);
    }
  } else {
    chrome.tabs.query({ active: true, windowId }, (tabs) => {
      if (tabs[0]) {
        activeTabId = tabs[0].id;
        handleUserInteraction(activeTabId);
      }
    });
  }
});

// Listen for messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getTabActivity") {
    // Get current tabs and send response
    chrome.tabs.query({}, (tabs) => {
      const activityData = getFormattedActivityData(tabs);
      sendResponse({ activityData });
    });
    return true; // Required for asynchronous response
  }
});

// Initialize connection tracking
let connections = 0;
chrome.runtime.onConnect.addListener((port) => {
  connections++;
  port.onDisconnect.addListener(() => {
    connections--;
  });
});

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.action === "getActiveTabs") {
//     // Query all active tabs in all windows
//     chrome.tabs.query({ active: true }, (tabs) => {
//       // Send back the list of active tabs
//       sendResponse({ activeTabs: tabs });
//     });
//     // Required to use sendResponse asynchronously
//     return true;
//   }
// });

// // background.js
// let tabData = {};
// let totalTimeSpent = 0;
// let lastActiveTime = {};
// let categories = {
//   'youtube.com': 'Youtube',
//   'google.com': 'Reading',
//   'github.com': 'Coding',
//   'fitbod.me': 'Exercise'
//   // Add more mappings as needed
// };

// // Initialize storage with default values
// chrome.runtime.onInstalled.addListener(() => {
//   chrome.storage.local.set({
//     tabTimeData: {},
//     totalTimeSpent: 0,
//     categoryData: {
//       Youtube: 0,
//       Reading: 0,
//       Coding: 0,
//       Exercise: 0
//     }
//   });
// });

// // Helper function to get category from URL
// function getCategoryFromUrl(url) {
//   try {
//     const hostname = new URL(url).hostname;
//     for (let domain in categories) {
//       if (hostname.includes(domain)) {
//         return categories[domain];
//       }
//     }
//     return 'Other';
//   } catch (e) {
//     return 'Other';
//   }
// }

// function updateTimeSpent() {
//   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     if (tabs[0]) {
//       const tabId = tabs[0].id;
//       const currentTime = Date.now();

//       if (lastActiveTime[tabId]) {
//         const timeSpent = currentTime - lastActiveTime[tabId];
//         const category = getCategoryFromUrl(tabs[0].url);

//         chrome.storage.local.get(['categoryData'], (result) => {
//           const categoryData = result.categoryData || {};
//           categoryData[category] = (categoryData[category] || 0) + timeSpent;

//           chrome.storage.local.set({ categoryData }, () => {
//             chrome.runtime.sendMessage({
//               type: 'timeUpdate',
//               data: categoryData
//             });
//           });
//         });

//         // Update total time
//         totalTimeSpent += timeSpent;
//         chrome.storage.local.set({ totalTimeSpent });
//       }

//       lastActiveTime[tabId] = currentTime;
//     }
//   });
// }

// // Track tab activation
// chrome.tabs.onActivated.addListener((activeInfo) => {
//   const tabId = activeInfo.tabId;
//   lastActiveTime[tabId] = Date.now();
// });

// // Track tab updates
// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   if (changeInfo.status === 'complete') {
//     lastActiveTime[tabId] = Date.now();
//   }
// });

// // Set up periodic time updates
// setInterval(updateTimeSpent, 1000); // Update every second

// // Listen for messages from popup
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.type === 'getTimeData') {
//     chrome.storage.local.get(['categoryData', 'totalTimeSpent'], (result) => {
//       sendResponse({
//         categoryData: result.categoryData || {},
//         totalTimeSpent: result.totalTimeSpent || 0
//       });
//     });
//     return true; // Required for async response
//   }
// });
