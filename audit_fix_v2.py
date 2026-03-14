#!/usr/bin/env python3
"""
Comprehensive audit and fix script for AI Tools Hub articles - V2
Fixes:
1. Missing ../style.css link (already done in v1 for 64 articles)
2. Missing <nav> navigation with homepage link (67 articles)
3. og:image w=800 -> w=1200 upgrade (329 articles)
4. Missing og:image:width/height tags (338 articles)
5. Missing article:published_time (69 articles)
6. Verify all have: title, description, canonical, og:*, twitter:*, schema
"""

import os
import re
import json
from pathlib import Path
from datetime import datetime

ARTICLES_DIR = Path("/data/.openclaw/workspace/adsense-site/articles")

NAV_HTML = '''<nav class="site-nav" style="background:#0f0f23;padding:12px 20px;display:flex;gap:20px;align-items:center;justify-content:center;flex-wrap:wrap;font-size:14px;">
      <a href="/" style="color:#e94560;text-decoration:none;font-weight:bold;">🏠 Home</a>
      <a href="/about.html" style="color:#ccc;text-decoration:none;">About</a>
      <a href="/#categories" style="color:#ccc;text-decoration:none;">Categories</a>
      <a href="/resources.html" style="color:#ccc;text-decoration:none;">Resources</a>
      <a href="/contact.html" style="color:#ccc;text-decoration:none;">Contact</a>
    </nav>'''


def extract_meta(html, prop_name, attr="content"):
    """Extract meta tag content by property or name."""
    # Try property=
    m = re.search(rf'<meta\s+property="{prop_name}"\s+{attr}="([^"]*)"', html)
    if m:
        return m.group(1)
    # Try name=
    m = re.search(rf'<meta\s+name="{prop_name}"\s+{attr}="([^"]*)"', html)
    if m:
        return m.group(1)
    # Try reversed order
    m = re.search(rf'{attr}="([^"]*)"[^>]*(?:property|name)="{prop_name}"', html)
    if m:
        return m.group(1)
    return None


def extract_title(html):
    m = re.search(r'<title>([^<]+)</title>', html)
    return m.group(1).strip() if m else ""


def extract_date_from_schema(html):
    """Try to find datePublished in schema."""
    m = re.search(r'"datePublished"\s*:\s*"([^"]+)"', html)
    return m.group(1) if m else None


def fix_article(filepath):
    """Fix all issues in a single article file."""
    filename = filepath.name
    fixes = []
    
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    
    original = html
    title = extract_title(html)
    description = extract_meta(html, "description") or ""
    
    # FIX 1: Ensure ../style.css is present
    if 'href="../style.css"' not in html:
        html = html.replace('</head>', '    <link rel="stylesheet" href="../style.css">\n</head>')
        fixes.append("css_link")
    
    # FIX 2: Add <nav> if missing
    if '<nav' not in html:
        body_match = re.search(r'<body[^>]*>', html)
        if body_match:
            insert_pos = body_match.end()
            html = html[:insert_pos] + '\n' + NAV_HTML + '\n' + html[insert_pos:]
            fixes.append("nav_added")
    
    # FIX 3: Upgrade og:image from w=800 to w=1200
    if 'og:image' in html and 'w=800' in html:
        # Only change in og:image and twitter:image meta tags
        html = re.sub(
            r'(content="https://images\.unsplash\.com/[^"]*)\?w=800(&[^"]*")',
            r'\1?w=1200\2',
            html
        )
        # Also fix in src attributes for hero images
        html = re.sub(
            r'(src="https://images\.unsplash\.com/[^"]*)\?w=800(&[^"]*")',
            r'\1?w=1200\2',
            html
        )
        # Fix in schema too
        html = re.sub(
            r'("image"\s*:\s*"https://images\.unsplash\.com/[^"]*)\?w=800(&[^"]*")',
            r'\1?w=1200\2',
            html
        )
        fixes.append("image_w1200")
    
    # FIX 4: Add og:image:width and og:image:height if missing
    if 'og:image' in html and 'og:image:width' not in html:
        # Find the og:image tag and add width/height after it
        html = re.sub(
            r'(<meta property="og:image" content="[^"]*">)',
            r'\1\n    <meta property="og:image:width" content="1200">\n    <meta property="og:image:height" content="630">',
            html
        )
        fixes.append("og_image_dimensions")
    
    # FIX 5: Add article:published_time if missing
    if 'article:published_time' not in html:
        pub_date = extract_date_from_schema(html)
        if not pub_date:
            pub_date = "2026-03-01"  # fallback date
        
        # Insert after og:locale or og:site_name or before twitter section
        if '<meta property="og:locale"' in html:
            html = re.sub(
                r'(<meta property="og:locale"[^>]*>)',
                r'\1\n    <meta property="article:published_time" content="' + pub_date + '">',
                html
            )
        elif '<meta property="og:site_name"' in html:
            html = re.sub(
                r'(<meta property="og:site_name"[^>]*>)',
                r'\1\n    <meta property="article:published_time" content="' + pub_date + '">',
                html
            )
        elif '<meta name="twitter:card"' in html:
            html = html.replace(
                '<meta name="twitter:card"',
                f'<meta property="article:published_time" content="{pub_date}">\n    <meta name="twitter:card"'
            )
        else:
            html = html.replace('</head>', f'    <meta property="article:published_time" content="{pub_date}">\n</head>')
        fixes.append("published_time")
    
    # Write if changed
    if html != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html)
    
    return fixes


def verify_article(filepath):
    """Verify all required elements are present after fixes."""
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    
    issues = []
    
    if not extract_title(html):
        issues.append("missing_title")
    if not extract_meta(html, "description"):
        issues.append("missing_description")
    if 'rel="canonical"' not in html:
        issues.append("missing_canonical")
    if 'og:title' not in html:
        issues.append("missing_og_title")
    if 'og:description' not in html:
        issues.append("missing_og_description")
    if 'og:image' not in html:
        issues.append("missing_og_image")
    if 'og:url' not in html:
        issues.append("missing_og_url")
    if 'og:type' not in html:
        issues.append("missing_og_type")
    if 'twitter:card' not in html:
        issues.append("missing_twitter_card")
    if 'twitter:image' not in html:
        issues.append("missing_twitter_image")
    if 'application/ld+json' not in html:
        issues.append("missing_schema")
    if 'href="../style.css"' not in html:
        issues.append("missing_css")
    if '<nav' not in html:
        issues.append("missing_nav")
    
    return issues


def main():
    articles = sorted(ARTICLES_DIR.glob("*.html"))
    total = len(articles)
    
    print(f"Processing {total} articles...")
    
    stats = {
        "css_link": 0,
        "nav_added": 0,
        "image_w1200": 0,
        "og_image_dimensions": 0,
        "published_time": 0,
    }
    
    fix_details = {}
    
    for i, article in enumerate(articles, 1):
        fixes = fix_article(article)
        if fixes:
            fix_details[article.name] = fixes
            for fix in fixes:
                stats[fix] = stats.get(fix, 0) + 1
        
        if i % 100 == 0:
            print(f"  [{i}/{total}] processed...")
    
    print(f"\n=== Fix Summary ===")
    for k, v in stats.items():
        print(f"  {k}: {v}")
    
    # Verify all articles
    print(f"\n=== Verification ===")
    remaining_issues = {}
    for article in articles:
        issues = verify_article(article)
        if issues:
            remaining_issues[article.name] = issues
    
    if remaining_issues:
        print(f"  {len(remaining_issues)} articles still have issues:")
        for name, issues in list(remaining_issues.items())[:20]:
            print(f"    {name}: {issues}")
    else:
        print(f"  ✅ All {total} articles pass verification!")
    
    # Save results
    results = {
        "total": total,
        "stats": stats,
        "fix_details": fix_details,
        "remaining_issues": remaining_issues,
    }
    
    with open("/tmp/audit_results_v2.json", "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\nResults saved to /tmp/audit_results_v2.json")


if __name__ == "__main__":
    main()
