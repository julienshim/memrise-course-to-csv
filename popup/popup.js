console.log("popup.html is connected to popup.js...");

const warning = document.getElementById("unfound-container");
const courseFound = document.getElementById("course-found");
const coursePhoto = document.getElementById("course-photo");
const validUrl = "https://app.memrise.com/course/";
let tabUrl;
let tabId;
let courseName;

chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
  tabUrl = tabs[0].url;
  tabId = tabs[0].id;
  if (tabUrl.includes(validUrl)) {
    const message = {
      test: "test",
    };
    chrome.tabs.sendMessage(tabId, message, (response) => {
      const { courseName, coursePhotoUrl } = response;
      courseFound.textContent = courseName;
      coursePhoto.src = coursePhotoUrl;
    });
    warning.classList.add("hidden");
  } else {
    warning.classList.remove("hidden");
  }
});

function download() {
  const message = {
    tabUrl,
  };
  chrome.tabs.sendMessage(tabId, message);
}

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("button-container")
    .addEventListener("click", download);
});


chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  document.querySelector('div#button-container').innerHTML = `<span>${message.status}</span>`;
});