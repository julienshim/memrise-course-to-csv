console.log("Background running...");

const buttonClicked = (tab) => {
  const msg = {
    tabUrl: tab.url,
  };
  chrome.tabs.sendMessage(tab.id, msg);
};

chrome.browserAction.onClicked.addListener(buttonClicked);
