let patchIndex = null;

async function loadIndex() {
  if (patchIndex) return patchIndex;
  const url = chrome.runtime.getURL("patch_index.json");
  const res = await fetch(url);
  patchIndex = await res.json();
  return patchIndex;
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "GET_PATCH_INDEX") {
    loadIndex().then(sendResponse);
    return true;
  }
});
