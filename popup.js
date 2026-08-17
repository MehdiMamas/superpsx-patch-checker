const countEl = document.getElementById("count");

async function loadStatus() {
  try {
    const index = await chrome.runtime.sendMessage({ type: "GET_PATCH_INDEX" });
    countEl.textContent = Object.keys(index).length.toLocaleString();
  } catch {
    countEl.textContent = "Error";
  }
}

loadStatus();
