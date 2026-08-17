const TITLE_ID_REGEX = /\b(CUSA\d{5}|PPSA\d{5})\b/gi;
const UPDATE_VER_REGEX = /update\s+([\d.]+)/i;
const VERSION_CELL_REGEX = /\(v([\d.]+)\)/i;
const FPS_REGEX = /60\s*fps|unlock\s*fps|remove\s*30\s*fps\s*cap/i;

const CYAN = { border: "#06b6d4", bg: "rgba(6, 182, 212, 0.15)", glow: "rgba(6, 182, 212, 0.3)" };
const GREEN = { border: "#22c55e", bg: "rgba(34, 197, 94, 0.15)", glow: "rgba(34, 197, 94, 0.3)" };
const RED = { border: "#ef4444", bg: "rgba(239, 68, 68, 0.1)", glow: "rgba(239, 68, 68, 0.3)" };

function normalizeVer(raw) {
  const parts = raw.split(".");
  const major = parseInt(parts[0]) || 0;
  const minor = parseInt(parts[1]) || 0;
  return `${major}.${String(minor).padStart(2, "0")}`;
}

function normalizePatchVer(raw) {
  if (!raw || raw === "mask") return raw;
  const stripped = raw.replace(/^0+/, "");
  return normalizeVer(stripped);
}

function is60fps(patch) {
  return FPS_REGEX.test(patch.name);
}

function findVersionTables() {
  const tables = document.querySelectorAll(
    "figure.wp-block-table table, .entry-content table"
  );
  const versionTables = [];

  for (const table of tables) {
    const rows = table.querySelectorAll("tr");
    if (rows.length === 0) continue;

    const firstRow = rows[0];
    const cells = firstRow.querySelectorAll("td, th");
    if (cells.length < 2) continue;

    const labelText = cells[0].textContent
      .replace(/\u00a0/g, " ")
      .trim()
      .toLowerCase();
    if (!labelText.startsWith("version")) continue;

    const versionText = cells[1].textContent.trim();
    const idMatches = versionText.match(TITLE_ID_REGEX);
    if (!idMatches) continue;

    const titleId = idMatches[0].toUpperCase();

    const pageVersions = [];
    const verCellMatch = versionText.match(VERSION_CELL_REGEX);
    if (verCellMatch) pageVersions.push(normalizeVer(verCellMatch[1]));

    const updateRows = [];
    for (const row of rows) {
      const rowCells = row.querySelectorAll("td, th");
      if (rowCells.length < 1) continue;
      const rowLabel = rowCells[0].textContent.trim();
      const updateMatch = rowLabel.match(UPDATE_VER_REGEX);
      if (updateMatch) {
        const norm = normalizeVer(updateMatch[1]);
        if (!pageVersions.includes(norm)) pageVersions.push(norm);
        updateRows.push({ row, version: norm });
      }
    }

    const container =
      table.closest("figure.wp-block-table") ||
      table.closest(".pcrstb-wrap") ||
      table;

    versionTables.push({
      titleId,
      table,
      container,
      versionText,
      pageVersions,
      updateRows,
    });
  }

  return versionTables;
}

function makeBadge(text, color) {
  const badge = document.createElement("div");
  badge.textContent = text;
  Object.assign(badge.style, {
    position: "absolute",
    top: "-12px",
    right: "12px",
    background: color,
    color: "#fff",
    fontWeight: "bold",
    fontSize: "11px",
    padding: "2px 10px",
    borderRadius: "4px",
    letterSpacing: "0.5px",
    zIndex: "10",
    boxShadow: `0 2px 6px ${color}66`,
  });
  return badge;
}

function highlightTable(entry, patches) {
  const { titleId, table, container, updateRows } = entry;
  container.style.position = "relative";
  container.style.borderRadius = "8px";

  const hasPatch = patches && patches.length > 0;

  if (!hasPatch) {
    container.style.border = `3px solid ${RED.border}`;
    container.style.boxShadow = `0 0 12px ${RED.glow}`;
    container.appendChild(makeBadge(`${titleId} — NO PATCH`, RED.border));
    const versionRow = table.querySelector("tr:first-child");
    if (versionRow) {
      for (const cell of versionRow.querySelectorAll("td, th")) {
        cell.style.backgroundColor = RED.bg;
      }
    }
    return;
  }

  const has60fps = patches.some(is60fps);
  const theme = has60fps ? CYAN : GREEN;
  const fpsPatches = patches.filter(is60fps);
  const otherPatches = patches.filter((p) => !is60fps(p));

  container.style.border = `3px solid ${theme.border}`;
  container.style.boxShadow = `0 0 12px ${theme.glow}`;

  let label = `${titleId} — `;
  if (has60fps) {
    label += `60 FPS`;
    if (otherPatches.length > 0) label += ` + ${otherPatches.length} more`;
  } else {
    label += `${patches.length} PATCH${patches.length > 1 ? "ES" : ""}`;
  }

  container.appendChild(makeBadge(label, theme.border));

  const versionRow = table.querySelector("tr:first-child");
  if (versionRow) {
    for (const cell of versionRow.querySelectorAll("td, th")) {
      cell.style.backgroundColor = theme.bg;
    }
  }

  const patchVersions = patches.map((p) => normalizePatchVer(p.appVer));
  const fpsVersions = fpsPatches.map((p) => normalizePatchVer(p.appVer));
  const hasMask = patchVersions.includes("mask");
  const fpsMask = fpsVersions.includes("mask");

  for (const { row, version } of updateRows) {
    const fpsMatch = fpsMask || fpsVersions.includes(version);
    const anyMatch = hasMask || patchVersions.includes(version);
    const rowCells = row.querySelectorAll("td, th");

    let rowTheme, checkColor, symbol;
    if (fpsMatch) {
      rowTheme = CYAN;
      checkColor = CYAN.border;
      symbol = " ✓ 60fps";
    } else if (anyMatch) {
      rowTheme = GREEN;
      checkColor = GREEN.border;
      symbol = " ✓";
    } else {
      rowTheme = RED;
      checkColor = RED.border;
      symbol = " ✗";
    }

    for (const cell of rowCells) {
      cell.style.backgroundColor = rowTheme.bg;
    }

    const tag = document.createElement("span");
    tag.textContent = symbol;
    Object.assign(tag.style, {
      color: checkColor,
      fontWeight: "bold",
      fontSize: "13px",
    });
    rowCells[0].appendChild(tag);
  }
}

async function run() {
  const versionTables = findVersionTables();
  if (versionTables.length === 0) return;

  const index = await chrome.runtime.sendMessage({ type: "GET_PATCH_INDEX" });
  if (!index) return;

  for (const entry of versionTables) {
    highlightTable(entry, index[entry.titleId] || null);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", run);
} else {
  run();
}
