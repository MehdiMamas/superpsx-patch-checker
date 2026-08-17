#!/usr/bin/env python3
"""Generates patch_index.json from extracted PS-Game-Patch release files."""

import os, re, json, sys

def extract_attr(tag, attr):
    m = re.search(rf'{attr}="([^"]*)"', tag)
    return m.group(1) if m else None

def build_index(patches_dir):
    patch_map = {}
    for subdir in ["xml", "xml_prospero"]:
        dirpath = os.path.join(patches_dir, subdir)
        if not os.path.isdir(dirpath):
            continue
        for fname in os.listdir(dirpath):
            if not fname.endswith(".xml"):
                continue
            title_id = fname.replace(".xml", "").upper()
            if not re.match(r"^(CUSA|PPSA)\d{5}$", title_id):
                continue
            with open(os.path.join(dirpath, fname), "r", encoding="utf-8") as f:
                text = f.read()
            patches = []
            for m in re.finditer(r"<Metadata\s([^>]+)>", text):
                tag = m.group(1)
                name = extract_attr(tag, "Name")
                app_ver = extract_attr(tag, "AppVer")
                if name:
                    patches.append({"name": name, "appVer": app_ver or "any"})
            if title_id not in patch_map:
                patch_map[title_id] = patches
            else:
                patch_map[title_id].extend(patches)
    return patch_map

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} <patches_directory>")
        sys.exit(1)
    patches_dir = sys.argv[1]
    if not os.path.isdir(patches_dir):
        print(f"Error: {patches_dir} is not a directory")
        sys.exit(1)
    patch_map = build_index(patches_dir)
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "patch_index.json")
    with open(out, "w") as f:
        json.dump(patch_map, f, separators=(",", ":"))
    print(f"Generated {out}: {len(patch_map)} title IDs")
