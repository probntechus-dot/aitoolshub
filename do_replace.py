#!/usr/bin/env python3
"""Master replacement script - reads content from content_*.py files and applies."""
import re
import os
import importlib
import glob

DIR = '/data/.openclaw/workspace/adsense-site/articles'
CONTENT_DIR = '/data/.openclaw/workspace/adsense-site'

def replace_content(filename, new_content):
    filepath = os.path.join(DIR, filename)
    with open(filepath, 'r') as f:
        html = f.read()
    
    # Match the placeholder content block
    pattern = r'(<div class="article-content">)\s*<h2>[^<]*</h2>\s*<p>Full article content goes here[^<]*</p>\s*(<h3>Key Takeaways</h3>\s*<ul>\s*<li>Content point 1</li>\s*<li>Content point 2</li>\s*<li>Content point 3</li>\s*</ul>)\s*(</div>)'
    
    replacement = r'\g<1>\n' + new_content + '\n      \\3'
    
    new_html, count = re.subn(pattern, replacement, html, count=1)
    
    if count == 0:
        print(f"  WARNING: No placeholder match in {filename}")
        return False
    
    with open(filepath, 'w') as f:
        f.write(new_html)
    return True

def main():
    # Import all content modules
    sys_path_added = False
    if CONTENT_DIR not in __import__('sys').path:
        __import__('sys').path.insert(0, CONTENT_DIR)
    
    all_articles = {}
    for pyfile in sorted(glob.glob(os.path.join(CONTENT_DIR, 'content_*.py'))):
        modname = os.path.basename(pyfile)[:-3]
        mod = importlib.import_module(modname)
        all_articles.update(mod.articles)
        print(f"Loaded {len(mod.articles)} articles from {modname}")
    
    print(f"\nTotal articles to process: {len(all_articles)}")
    
    success = 0
    fail = 0
    for fname, content in all_articles.items():
        filepath = os.path.join(DIR, fname)
        if not os.path.exists(filepath):
            print(f"  SKIP: {fname} (file not found)")
            fail += 1
            continue
        if replace_content(fname, content):
            print(f"  OK: {fname}")
            success += 1
        else:
            fail += 1
    
    print(f"\nDone: {success} succeeded, {fail} failed")

if __name__ == '__main__':
    main()
