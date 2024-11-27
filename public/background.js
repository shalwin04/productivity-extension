/*global chrome*/

let activeTabId = null; // ID of the currently active tab
let lastActiveTime = Date.now(); // Timestamp of the last tab activation
let tabTimeData = {}; // Object to store time spent on each tab

// Function to update time spent on the currently active tab
function updateTimeSpent() {
  if (activeTabId !== null) {
    const currentTime = Date.now();
    const timeSpent = currentTime - lastActiveTime;

    // Convert to minutes and update time data
    tabTimeData[activeTabId] =
      (tabTimeData[activeTabId] || 0) + timeSpent / 60000;

    lastActiveTime = currentTime;
  }
}

// Listen for tab activations
chrome.tabs.onActivated.addListener((activeInfo) => {
  updateTimeSpent(); // Update time for the previously active tab
  activeTabId = activeInfo.tabId; // Set the new active tab
  lastActiveTime = Date.now(); // Reset the activation time
});

// Listen for tab updates (e.g., URL change)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.active && changeInfo.status === "complete") {
    updateTimeSpent(); // Update time for the previous state
    activeTabId = tabId; // Update the active tab ID
    lastActiveTime = Date.now(); // Reset activation time
  }
});

// Track when the browser window loses or regains focus
chrome.windows.onFocusChanged.addListener((windowId) => {
  updateTimeSpent(); // Update time spent on the current tab

  // If focus is on a valid window, update active tab
  if (windowId !== chrome.windows.WINDOW_ID_NONE) {
    chrome.tabs.query({ active: true, windowId }, (tabs) => {
      if (tabs[0]) {
        activeTabId = tabs[0].id;
        lastActiveTime = Date.now();
      }
    });
  } else {
    activeTabId = null; // No active tab
  }
});

// Listener for messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getTabTimes") {
    updateTimeSpent(); // Ensure the latest time is updated
    chrome.tabs.query({}, (tabs) => {
      const tabTimes = tabs.map((tab) => {
        if (tab.url) {
          try {
            // Extract hostname from URL
            const hostname = new URL(tab.url).hostname;
            const domainParts = hostname.split(".");
            const name =
              domainParts.length > 2
                ? domainParts.slice(-2).join(".")
                : hostname;
            const timeSpent = tabTimeData[tab.id] || 0; // Time in minutes
            return { name, timeSpent: timeSpent.toFixed(2) }; // Return 2 decimal places
          } catch (error) {
            console.error("Error parsing URL:", tab.url, error);
            return { name: "Unknown Site", timeSpent: 0 };
          }
        } else {
          return { name: "Unknown Site", timeSpent: 0 };
        }
      });

      sendResponse({ tabTimes });
    });
    return true; // Required to send response asynchronously
  }
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
