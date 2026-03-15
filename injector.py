#!/usr/bin/env python3
"""
Master injector: reads content from content_*.py files and injects into HTML articles.
Each content file defines a dict CONTENT = {"filename.html": "html_content_string"}
"""
import re, os, sys, glob, importlib.util

DIR = "/data/.openclaw/workspace/adsense-site/articles"
CONTENT_DIR = "/data/.openclaw/workspace/adsense-site"

def inject_content(filepath, new_content):
    """Replace <div class="article-content">...</div> placeholder with new content."""
    with open(filepath, 'r') as f:
        html = f.read()
    
    # Pattern: <div class="article-content"> ... </div> followed by author-box
    pattern = r'(<div class="article-content">)(.*?)(</div>\s*\n\s*<div class="author-box">)'
    
    match = re.search(pattern, html, re.DOTALL)
    if not match:
        print(f"  WARNING: Could not find article-content div in {filepath}")
        return False
    
    replacement = match.group(1) + "\n" + new_content.strip() + "\n      " + match.group(3)
    new_html = html[:match.start()] + replacement + html[match.end():]
    
    with open(filepath, 'w') as f:
        f.write(new_html)
    
    return True

def main():
    # Load all content_*.py files
    all_content = {}
    content_files = sorted(glob.glob(os.path.join(CONTENT_DIR, "content_*.py")))
    
    for cf in content_files:
        module_name = os.path.basename(cf)[:-3]
        spec = importlib.util.spec_from_file_location(module_name, cf)
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        if hasattr(mod, 'CONTENT'):
            all_content.update(mod.CONTENT)
            print(f"Loaded {len(mod.CONTENT)} articles from {os.path.basename(cf)}")
    
    print(f"\nTotal content entries: {len(all_content)}")
    
    success = 0
    failed = 0
    for filename, content in all_content.items():
        filepath = os.path.join(DIR, filename)
        if not os.path.exists(filepath):
            print(f"  SKIP: {filename} not found")
            failed += 1
            continue
        
        if inject_content(filepath, content):
            print(f"  OK: {filename}")
            success += 1
        else:
            failed += 1
    
    print(f"\nDone: {success} succeeded, {failed} failed")

if __name__ == "__main__":
    main()
