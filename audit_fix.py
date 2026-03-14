#!/usr/bin/env python3
"""
Comprehensive audit and fix script for AI Tools Hub articles.
Fixes:
1. Missing ../style.css link
2. Missing og:image meta tags
3. Missing homepage navigation
4. Missing og:image on 18 specific articles
"""

import os
import re
import json
from pathlib import Path

ARTICLES_DIR = Path("/data/.openclaw/workspace/adsense-site/articles")
REPORT = {
    "css_fixed": [],
    "ogimage_fixed": [],
    "nav_fixed": [],
    "twitter_image_fixed": [],
    "already_good": [],
    "errors": [],
}

# Unsplash image mapping by topic keywords
UNSPLASH_IMAGES = {
    # Technology & AI general
    "ai": "photo-1677442136019-21780ecad995",
    "artificial-intelligence": "photo-1677442136019-21780ecad995",
    "machine-learning": "photo-1555949963-aa79dcee981c",
    "automation": "photo-1485827404703-89b55fcc595e",
    "robot": "photo-1485827404703-89b55fcc595e",
    
    # Business & Marketing
    "marketing": "photo-1460925895917-afdab827c52f",
    "business": "photo-1507003211169-0a1dd7228f2d",
    "ecommerce": "photo-1556742049-0cfed4f6a45d",
    "e-commerce": "photo-1556742049-0cfed4f6a45d",
    "sales": "photo-1556742049-0cfed4f6a45d",
    "crm": "photo-1552664730-d307ca884978",
    "email": "photo-1596526131083-e8c633c948d2",
    "branding": "photo-1493612276216-ee3925520721",
    "brand": "photo-1493612276216-ee3925520721",
    
    # Content & Creative
    "content": "photo-1542435503-956c469947f6",
    "writing": "photo-1455390582262-044cdead277a",
    "video": "photo-1579353977991-54e0c8b13ebc",
    "photo": "photo-1516035069371-29a1b244cc32",
    "design": "photo-1561070791-2526d30994b5",
    "presentation": "photo-1557804506-669a67965ba0",
    "voice": "photo-1478737270239-2f02b77fc618",
    "podcast": "photo-1478737270239-2f02b77fc618",
    
    # Industry specific
    "healthcare": "photo-1576091160399-112ba8d25d1d",
    "finance": "photo-1611974789855-9c2a0a7236a3",
    "real-estate": "photo-1560518883-ce09059eeffa",
    "education": "photo-1503676260728-1c00da094a0b",
    "manufacturing": "photo-1581092918056-0c4c3acd3789",
    "restaurant": "photo-1414235077428-338989a2e8c0",
    "fitness": "photo-1534438327276-14e5300c3a48",
    "fashion": "photo-1558618666-fcd25c85f82e",
    "travel": "photo-1476514525535-07fb3b4ae5f1",
    "insurance": "photo-1450101499163-c8848e968252",
    "nonprofit": "photo-1559027615-cd4628902d4a",
    "consulting": "photo-1552664730-d307ca884978",
    "legal": "photo-1589829545856-d10d557cf95f",
    "construction": "photo-1504307651254-35680f356dfd",
    "logistics": "photo-1586528116311-ad8dd3c8310d",
    "agriculture": "photo-1574943320219-553eb213f72d",
    
    # Dev & Tech
    "developer": "photo-1461749280684-dccba630e2f6",
    "code": "photo-1461749280684-dccba630e2f6",
    "coding": "photo-1461749280684-dccba630e2f6",
    "seo": "photo-1432888498266-38ffec3eaf0a",
    "website": "photo-1467232004584-a241de8bcf5d",
    "data": "photo-1551288049-bebda4e38f71",
    "analytics": "photo-1551288049-bebda4e38f71",
    "security": "photo-1555949963-ff9fe0c870eb",
    "cybersecurity": "photo-1555949963-ff9fe0c870eb",
    "cloud": "photo-1544197150-b99a580bb7a8",
    "api": "photo-1558494949-ef010cbdcc31",
    
    # Tools
    "chatgpt": "photo-1677442136019-21780ecad995",
    "claude": "photo-1677442136019-21780ecad995",
    "zapier": "photo-1485827404703-89b55fcc595e",
    "notion": "photo-1484480974693-6ca0a78fb36b",
    "scheduling": "photo-1506784983877-45594efa4cbe",
    "project-management": "photo-1611224923853-80b023f02d71",
    "grammarly": "photo-1455390582262-044cdead277a",
    
    # Comparisons
    "comparison": "photo-1553877522-43269d4ea984",
    "vs": "photo-1553877522-43269d4ea984",
    "review": "photo-1553877522-43269d4ea984",
    
    # Freelance & Entrepreneurship
    "freelance": "photo-1522071820081-009f0129c71c",
    "solopreneur": "photo-1522071820081-009f0129c71c",
    "entrepreneur": "photo-1522071820081-009f0129c71c",
    "startup": "photo-1559136555-9303baea8ebd",
    
    # Productivity
    "productivity": "photo-1484480974693-6ca0a78fb36b",
    "workflow": "photo-1484480974693-6ca0a78fb36b",
    "time": "photo-1506784983877-45594efa4cbe",
    
    # Default
    "default": "photo-1620712943543-bcc4688e7485",
}

def get_image_for_filename(filename):
    """Pick the best Unsplash image based on filename keywords."""
    fname = filename.lower().replace(".html", "")
    
    # Try specific matches first
    for keyword, photo_id in UNSPLASH_IMAGES.items():
        if keyword in fname:
            return f"https://images.unsplash.com/{photo_id}?w=1200&q=80"
    
    # Default AI image
    return f"https://images.unsplash.com/{UNSPLASH_IMAGES['default']}?w=1200&q=80"


def extract_title(html):
    """Extract title from <title> tag."""
    m = re.search(r'<title>([^<]+)</title>', html)
    return m.group(1) if m else "AI Tools Hub Article"


def extract_description(html):
    """Extract meta description."""
    m = re.search(r'<meta\s+name="description"\s+content="([^"]*)"', html)
    if m:
        return m.group(1)
    m = re.search(r'content="([^"]*)"[^>]*name="description"', html)
    return m.group(1) if m else ""


def fix_article(filepath):
    """Fix all issues in a single article file."""
    filename = filepath.name
    fixes = []
    
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    
    original = html
    title = extract_title(html)
    description = extract_description(html)
    url = f"https://aitoolshub.com/articles/{filename}"
    
    # FIX 1: Add ../style.css if missing
    has_stylesheet = 'href="../style.css"' in html
    if not has_stylesheet:
        # Check if it has inline <style> - add the stylesheet link before </head>
        if '<style>' in html:
            # Add stylesheet link after the inline style block (so it can override)
            # Actually, add it before </head>
            html = html.replace('</head>', '    <link rel="stylesheet" href="../style.css">\n</head>')
            fixes.append("Added ../style.css link")
        else:
            html = html.replace('</head>', '    <link rel="stylesheet" href="../style.css">\n</head>')
            fixes.append("Added ../style.css link")
    
    # FIX 2: Add og:image if missing
    has_og_image = 'og:image' in html
    if not has_og_image:
        image_url = get_image_for_filename(filename)
        og_image_tags = f'''    <meta property="og:image" content="{image_url}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">'''
        
        # Insert after og:url or og:description or before twitter:card
        if '<meta property="og:url"' in html:
            html = re.sub(
                r'(<meta property="og:url"[^>]*>)',
                r'\1\n' + og_image_tags,
                html
            )
        elif '<meta name="twitter:card"' in html:
            html = html.replace(
                '<meta name="twitter:card"',
                og_image_tags + '\n    <meta name="twitter:card"'
            )
        else:
            # Insert before </head>
            html = html.replace('</head>', og_image_tags + '\n</head>')
        
        fixes.append(f"Added og:image ({image_url})")
    
    # FIX 2b: Add twitter:image if missing (but twitter:card exists)
    has_twitter_image = 'twitter:image' in html
    if not has_twitter_image and 'twitter:card' in html:
        # Get the og:image URL to reuse
        m = re.search(r'<meta property="og:image" content="([^"]*)"', html)
        if m:
            img_url = m.group(1)
        else:
            img_url = get_image_for_filename(filename)
        
        twitter_image_tag = f'    <meta name="twitter:image" content="{img_url}">'
        
        # Insert after last twitter tag
        if '<meta name="twitter:description"' in html:
            html = re.sub(
                r'(<meta name="twitter:description"[^>]*>)',
                r'\1\n' + twitter_image_tag,
                html
            )
        elif '<meta name="twitter:title"' in html:
            html = re.sub(
                r'(<meta name="twitter:title"[^>]*>)',
                r'\1\n' + twitter_image_tag,
                html
            )
        elif '<meta name="twitter:card"' in html:
            html = re.sub(
                r'(<meta name="twitter:card"[^>]*>)',
                r'\1\n' + twitter_image_tag,
                html
            )
        fixes.append("Added twitter:image")
    
    # FIX 3: Add homepage navigation if missing
    has_home_link = bool(re.search(r'href="\.\./index\.html|href="/index\.html|href="/"|href="\.\\./"', html))
    if not has_home_link:
        # Check if there's a <nav> already
        if '<nav' in html:
            # There's a nav but no home link - add one
            # Find the nav and add a home link
            nav_match = re.search(r'<nav[^>]*>(.*?)</nav>', html, re.DOTALL)
            if nav_match:
                nav_content = nav_match.group(0)
                # Add home link at start of nav content
                new_nav = nav_content.replace('>', '>\n        <a href="../index.html" style="margin-right:15px;color:inherit;text-decoration:none;font-weight:bold;">← Home</a>', 1)
                html = html.replace(nav_content, new_nav)
                fixes.append("Added homepage link to existing nav")
        else:
            # No nav at all - add one after <body>
            nav_html = '''
    <nav style="background:#1a1a2e;padding:12px 20px;text-align:center;">
        <a href="../index.html" style="color:#e94560;text-decoration:none;font-weight:bold;font-size:1.1em;">← AI Tools Hub Home</a>
    </nav>'''
            
            # Try to insert after <body> tag
            body_match = re.search(r'<body[^>]*>', html)
            if body_match:
                insert_pos = body_match.end()
                html = html[:insert_pos] + nav_html + html[insert_pos:]
                fixes.append("Added navigation bar with homepage link")
    
    # Only write if changes were made
    if html != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html)
        return fixes
    else:
        return []


def main():
    print("=" * 60)
    print("AI Tools Hub Article Audit & Fix")
    print("=" * 60)
    
    articles = sorted(ARTICLES_DIR.glob("*.html"))
    total = len(articles)
    print(f"\nFound {total} articles to audit.\n")
    
    css_fixed = []
    ogimage_fixed = []
    nav_fixed = []
    twitter_fixed = []
    already_good = []
    errors = []
    
    for i, article in enumerate(articles, 1):
        try:
            fixes = fix_article(article)
            if fixes:
                for fix in fixes:
                    if "style.css" in fix:
                        css_fixed.append(article.name)
                    elif "og:image" in fix:
                        ogimage_fixed.append((article.name, fix))
                    elif "nav" in fix.lower() or "homepage" in fix.lower():
                        nav_fixed.append(article.name)
                    elif "twitter:image" in fix:
                        twitter_fixed.append(article.name)
                if i % 50 == 0:
                    print(f"  [{i}/{total}] Fixed: {article.name} - {fixes}")
            else:
                already_good.append(article.name)
        except Exception as e:
            errors.append((article.name, str(e)))
            print(f"  ERROR: {article.name} - {e}")
    
    print(f"\n{'='*60}")
    print(f"AUDIT COMPLETE")
    print(f"{'='*60}")
    print(f"Total articles: {total}")
    print(f"CSS fixed: {len(css_fixed)}")
    print(f"og:image added: {len(ogimage_fixed)}")
    print(f"Navigation added: {len(nav_fixed)}")
    print(f"twitter:image added: {len(twitter_fixed)}")
    print(f"Already good: {len(already_good)}")
    print(f"Errors: {len(errors)}")
    
    # Write detailed results to JSON for report generation
    results = {
        "total": total,
        "css_fixed": css_fixed,
        "ogimage_fixed": [(n, f) for n, f in ogimage_fixed],
        "nav_fixed": nav_fixed,
        "twitter_fixed": twitter_fixed,
        "already_good_count": len(already_good),
        "errors": errors,
    }
    
    with open("/tmp/audit_results.json", "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\nDetailed results saved to /tmp/audit_results.json")


if __name__ == "__main__":
    main()
