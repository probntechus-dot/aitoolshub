#!/usr/bin/env python3
"""Replace placeholder content in an article file. 
Usage: python3 replace.py <filename> <content_file>
The content_file should contain just the inner HTML to go inside <div class="article-content">"""
import re, sys, os

ARTICLES_DIR = "/data/.openclaw/workspace/adsense-site/articles"
CONTENT_DIR = "/data/.openclaw/workspace/adsense-site/content"

def replace_placeholder(filepath, content_html):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Pattern: match the article-content div with placeholder
    pattern = re.compile(
        r'(<div class="article-content">)\s*'
        r'<h2>[^<]*</h2>\s*'
        r'<p>Full article content goes here\.[^<]*</p>\s*'
        r'(?:\s*<h3>Key Takeaways</h3>\s*'
        r'<ul>\s*'
        r'<li>Content point 1</li>\s*'
        r'<li>Content point 2</li>\s*'
        r'<li>Content point 3</li>\s*'
        r'</ul>\s*)?'
        r'(</div>)',
        re.DOTALL
    )
    
    replacement = r'\1\n' + content_html + r'\n      \2'
    new_html, count = pattern.subn(replacement, html, count=1)
    
    if count == 0:
        print(f"FAIL: No placeholder found in {filepath}")
        return False
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_html)
    print(f"OK: {os.path.basename(filepath)}")
    return True

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python3 replace.py <article_filename> <content_filename>")
        sys.exit(1)
    
    article_path = os.path.join(ARTICLES_DIR, sys.argv[1])
    content_path = os.path.join(CONTENT_DIR, sys.argv[2])
    
    with open(content_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    replace_placeholder(article_path, content)
