# SuperPSX Patch Checker

A Chrome extension that highlights game versions on [SuperPSX](https://www.superpsx.com) that have patches available from the [PS-Game-Patch](https://github.com/illusionyy/PS-Game-Patch) repository.

## What it does

When browsing game download pages on SuperPSX, the extension scans each version table for its title ID (CUSA/PPSA) and cross-references it against a bundled patch index.

### Color coding

| Color | Meaning |
|-------|---------|
| **Cyan** | 60 FPS patch available |
| **Green** | Other patches available (resolution, debug menu, etc.) |
| **Red** | No patches found for this title ID |

Each badge shows the detected title ID and patch summary. Update rows within a table are individually marked with ✓ or ✗ depending on whether a patch targets that specific app version.

## Install

1. Download or clone this repository
2. Open `chrome://extensions` in Chrome
3. Enable **Developer mode** (top right)
4. Click **Load unpacked** and select the project folder

## How it works

- `patch_index.json` — Pre-built index of 376 title IDs and their patches, generated from the [PS-Game-Patch releases](https://github.com/illusionyy/PS-Game-Patch/releases)
- `content.js` — Content script that runs on SuperPSX pages, finds version tables, and applies highlights
- `background.js` — Service worker that loads the patch index and serves it to the content script
- `popup.html` / `popup.js` — Toolbar popup showing how many title IDs are indexed

## Updating the patch index

To update `patch_index.json` with newer patch data:

1. Download the latest `patch1.zip` from [PS-Game-Patch releases](https://github.com/illusionyy/PS-Game-Patch/releases)
2. Extract it
3. Run the index generator:

```bash
python3 generate_index.py /path/to/extracted/patches
```

## Built with

- Chrome Extension Manifest V3
- Patch data from [illusionyy/PS-Game-Patch](https://github.com/illusionyy/PS-Game-Patch)
- Tested on [SuperPSX](https://www.superpsx.com)
