(function () {
  setTimeout(() => {
    console.clear();
  }, 1000);
})();

const download = (data) => {
  console.log("Downloading CSV...");
  const blob = new Blob([data], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.setAttribute("hidden", "");
  a.setAttribute("href", url);
  const courseName = document.querySelector("div.course-details > a > h1")
    .innerText;
  a.setAttribute("download", `${courseName}.csv`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

const arrayToCsv = (dataArray) => {
  console.log("Generating CSV...");
  let maxHeaderLength = 0;
  let headers = [];
  const csvRows = [];
  // Find the max amount of keys and set as headers
  for (const row of dataArray) {
    if (Object.keys(row).length > maxHeaderLength) {
      maxHeaderLength = Object.keys(row).length;
      headers = Object.keys(row);
    }
  }
  csvRows.push(headers.join(","));
  for (const row of dataArray) {
    const values = headers.map((header) => {
      const value = row[header] ? row[header] : "";
      const escaped = value.replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(","));
  }
  return csvRows.join("\n");
};

const getWords = (courseId, level, levelEnd) => {
  const url = `https://app.memrise.com/ajax/session/?course_id=${courseId}&level_index=${level}&session_slug=preview`;
  const data = { credentials: "same-origin" };

  return fetch(url, data)
    .then((response) => {
      if (response.status === 200) {
        return (
          response
            .json()
            // map results
            .then((data) => {
              // data.screens are words per level
              const levelWords = Object.keys(data.screens);
              return levelWords.map((word) => {
                // For each word in a level, we are only concerned with the item (target language word), the definition (in native language), and attributes (extra columns).
                const { item, definition, attributes } = data.screens[word][
                  "1"
                ];
                // Define the public 'faces' of the word we want to map out.
                const object = {
                  item: item.value,
                  definition: definition.value,
                };
                // Since attributes are private we can just loop through them if they exist.
                if (attributes) {
                  for (const attribute of attributes) {
                    object[attribute.label] = attribute.value;
                  }
                }
                return object;
              });
            })
            .then((words) => {
              if (level + 1 <= levelEnd) {
                return getWords(courseId, level + 1, levelEnd).then(
                  words.concat.bind(words)
                );
              } else {
                return words;
              }
            })
        );
      } else {
        return [];
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

const getVocabularyList = (tabUrl) => {
  console.log("Generating vocabulary list...");
  const levelStart = 1;
  const levelEnd = document.querySelectorAll(".level").length;
  const courseId = tabUrl.match(/(?:[\d]{1,})/)[0];
  getWords(courseId, levelStart, levelEnd).then((words) => {
    const csv = arrayToCsv(words);
    download(csv);
  });
};

const handleMessage = (request, sender, sendResponse) => {
  const { test, tabUrl } = request;
  if (test) {
    const courseName = document.querySelector("h1.course-name").textContent;
    const coursePhotoUrl = document.querySelector("a.course-photo > img").src;
    console.log(courseName);
    sendResponse({ courseName, coursePhotoUrl });
  } else if (tabUrl) {
    getVocabularyList(tabUrl);
  }
};

chrome.runtime.onMessage.addListener(handleMessage);
