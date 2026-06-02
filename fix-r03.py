#!/usr/bin/env python3
"""R03+R05: Fix all remaining eastern-five-elements.vercel.app in JSON-LD, canonical, and links."""
import os, re, glob

ROOT = "/Users/yihua/.openclaw/workspace"
EXCLUDE = {"node_modules", ".git", "1099savvy", "passterra", "social-sniper", "images"}

count_files = 0
count_fixes = 0

for dirpath, dirnames, filenames in os.walk(ROOT):
    dirnames[:] = [d for d in dirnames if d not in EXCLUDE]
    for f in filenames:
        if not f.endswith(".html") and not f.endswith(".xml"):
            continue
        fpath = os.path.join(dirpath, f)
        with open(fpath, "r", encoding="utf-8", errors="replace") as fh:
            content = fh.read()

        if "eastern-five-elements" not in content:
            continue

        # Replace all occurrences
        new_content = content.replace("eastern-five-elements.vercel.app", "metaphysicflow.com")
        
        if new_content != content:
            with open(fpath, "w", encoding="utf-8") as fh:
                fh.write(new_content)
            count_files += 1
            count_fixes += content.count("eastern-five-elements")

print(f"✅ R03: Fixed {count_fixes} occurrences in {count_files} files")
print()

# Verify
remaining = 0
for dirpath, dirnames, filenames in os.walk(ROOT):
    dirnames[:] = [d for d in dirnames if d not in EXCLUDE]
    for f in filenames:
        if not f.endswith(".html") and not f.endswith(".xml"):
            continue
        fpath = os.path.join(dirpath, f)
        with open(fpath, "r", encoding="utf-8", errors="replace") as fh:
            if "eastern-five-elements" in fh.read():
                remaining += 1
                print(f"  Remaining in: {os.path.relpath(fpath, ROOT)}")

print(f"\nRemaining files: {remaining}")
print("DONE" if remaining == 0 else "NEEDS ATTENTION")
