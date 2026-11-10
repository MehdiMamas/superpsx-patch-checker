# Contributing

Thanks for helping out. This is a small Chrome extension with no build step, so getting started takes a minute.

## Set up

1. Fork and clone the repo.
2. Open `chrome://extensions`, turn on **Developer mode**, click **Load unpacked** and pick the repo folder.
3. After each change, click the reload icon on the extension card and refresh the SuperPSX page.

## What goes where

- `content.js`: finds the title ID on a SuperPSX page and adds the highlights.
- `background.js`: loads `patch_index.json` and hands it to the content script.
- `popup.html` / `popup.js`: the toolbar popup.
- `generate_index.py`: rebuilds `patch_index.json` from the PS-Game-Patch release files. Never edit `patch_index.json` by hand.

## Before you open a pull request

- Run the same checks as CI:
  ```bash
  for f in *.js; do node --check "$f"; done
  python3 -m py_compile generate_index.py
  python3 -c "import json; json.load(open('manifest.json')); json.load(open('patch_index.json'))"
  ```
- Test on at least one SuperPSX game page with a patch and one without, and add a screenshot to the PR if the look changed.
- Keep pull requests small and focused on one thing.

## Reporting a page that is not highlighted

Open a [bug report](https://github.com/MehdiMamas/superpsx-patch-checker/issues/new?template=bug_report.yml) with the page link and the title ID shown on it.
