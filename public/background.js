/*global chrome*/
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getTabNames") {
    // Query all open tabs
    chrome.tabs.query({}, (tabs) => {
      // Extract names of the tabs from their URLs
      const tabNames = tabs.map((tab) => {
        if (tab.url) {
          try {
            // Create a URL object to extract hostname
            const hostname = new URL(tab.url).hostname;
            // Remove subdomains (if needed) and return the base domain
            const domainParts = hostname.split(".");
            const name =
              domainParts.length > 2
                ? domainParts.slice(-2).join(".") // e.g., "google.com"
                : hostname; // e.g., "localhost"
            return name;
          } catch (error) {
            console.error("Error parsing URL:", tab.url, error);
            return "Unknown Site";
          }
        } else {
          return "Unknown Site";
        }
      });

      // Send back the list of names
      sendResponse({ tabNames });
    });
    // Required to use sendResponse asynchronously
    return true;
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
