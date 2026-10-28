# AGENTS.md

## What it is
A Chrome extension (Manifest V3, plain JS, no build step) that highlights game versions on SuperPSX which have patches in the PS-Game-Patch repository, using a bundled index. README.md explains the color coding.

## Run
Open `chrome://extensions`, enable Developer mode, Load unpacked, and select the repo folder. Reload the extension after edits.

## Where things live
- `content.js`: runs on SuperPSX pages, finds version tables, applies highlights.
- `background.js`: service worker that loads and serves the patch index.
- `popup.html` / `popup.js`: toolbar popup showing the indexed count.
- `patch_index.json`: generated; do not edit by hand.
- `generate_index.py`: rebuilds the index: `python3 generate_index.py /path/to/extracted/patches` (patches from the PS-Game-Patch releases `patch1.zip`).
- `manifest.json`, `icons/`.

## Gotchas
- `examples/` is gitignored.
- No tests or CI in this repo.
