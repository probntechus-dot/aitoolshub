#!/usr/bin/env python3
import os, re, html
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SITE_URL = "https://aitoolshub.com"
ARTICLES_DIR = os.path.join(BASE_DIR, "articles")

ROOT_PAGES = [
    "index.html", "about.html", "contact.html", "privacy.html", "disclaimer.html", "resources.html"
]


def read(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def write(path, content):
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)


def first_match(pattern, text, flags=re.I | re.S):
    m = re.search(pattern, text, flags)
    return m.group(1).strip() if m else ""


def strip_tags(s):
    return re.sub(r"<[^>]+>", "", s or "").strip()


def normalize_ws(s):
    return re.sub(r"\s+", " ", s).strip()


def ensure_meta_tag(head_html, key, value, is_property=False):
    if not value:
        return head_html
    attr = "property" if is_property else "name"
    pattern = rf'<meta[^>]+{attr}=["\']{re.escape(key)}["\'][^>]*>'
    tag = f'<meta {attr}="{key}" content="{html.escape(value, quote=True)}">'
    if re.search(pattern, head_html, re.I):
        return re.sub(pattern, tag, head_html, flags=re.I)
    return head_html + "\n  " + tag


def ensure_canonical(head_html, canonical_url):
    tag = f'<link rel="canonical" href="{canonical_url}">'
    pattern = r'<link[^>]+rel=["\']canonical["\'][^>]*>'
    if re.search(pattern, head_html, re.I):
        return re.sub(pattern, tag, head_html, flags=re.I)
    return head_html + "\n  " + tag


def upsert_jsonld(doc, marker, payload):
    script = f'<script type="application/ld+json" data-schema="{marker}">{payload}</script>'
    pattern = rf'<script[^>]+type=["\']application/ld\+json["\'][^>]*data-schema=["\']{re.escape(marker)}["\'][^>]*>.*?</script>'
    if re.search(pattern, doc, re.I | re.S):
        return re.sub(pattern, script, doc, flags=re.I | re.S)
    return re.sub(r"</head>", "  " + script + "\n</head>", doc, count=1, flags=re.I)


def pick_description(doc):
    desc = first_match(r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']+)["\']', doc)
    if desc:
        return normalize_ws(desc)[:160]
    # fallback first paragraph
    p = first_match(r"<p[^>]*>(.*?)</p>", doc)
    p = normalize_ws(strip_tags(p))
    return (p[:157] + "...") if len(p) > 160 else p


def article_date_iso(doc):
    # Try patterns like Mar 12, 2026
    txt = first_match(r"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}", doc)
    if txt:
        try:
            return datetime.strptime(txt, "%b %d, %Y").date().isoformat()
        except Exception:
            pass
    return datetime.utcnow().date().isoformat()


def process_file(path, is_article):
    doc = read(path)
    original = doc

    title = normalize_ws(first_match(r"<title>(.*?)</title>", doc))
    if not title:
        title = "AI Tools Hub"

    description = pick_description(doc)

    rel = os.path.relpath(path, BASE_DIR).replace("\\", "/")
    url_path = "/" if rel == "index.html" else f"/{rel}"
    canonical = SITE_URL + url_path

    # split head
    hm = re.search(r"<head>(.*?)</head>", doc, re.I | re.S)
    if not hm:
        return False, "no <head>"
    head_inner = hm.group(1)

    head_inner = ensure_meta_tag(head_inner, "description", description)
    head_inner = ensure_meta_tag(head_inner, "robots", "index, follow")
    head_inner = ensure_canonical(head_inner, canonical)

    # Open Graph + Twitter
    og_type = "article" if is_article else "website"
    head_inner = ensure_meta_tag(head_inner, "og:title", title, is_property=True)
    head_inner = ensure_meta_tag(head_inner, "og:description", description, is_property=True)
    head_inner = ensure_meta_tag(head_inner, "og:type", og_type, is_property=True)
    head_inner = ensure_meta_tag(head_inner, "og:url", canonical, is_property=True)
    head_inner = ensure_meta_tag(head_inner, "og:site_name", "AI Tools Hub", is_property=True)

    head_inner = ensure_meta_tag(head_inner, "twitter:card", "summary_large_image")
    head_inner = ensure_meta_tag(head_inner, "twitter:title", title)
    head_inner = ensure_meta_tag(head_inner, "twitter:description", description)

    doc = doc[:hm.start(1)] + head_inner + doc[hm.end(1):]

    # JSON-LD
    if is_article:
        author = first_match(r'<meta[^>]+name=["\']author["\'][^>]+content=["\']([^"\']+)["\']', doc) or "Sarah Mitchell"
        published = article_date_iso(doc)
        article_schema = (
            '{'
            '"@context":"https://schema.org",'
            '"@type":"Article",'
            f'"headline":"{html.escape(title, quote=True)}",'
            f'"description":"{html.escape(description, quote=True)}",'
            f'"author":{{"@type":"Person","name":"{html.escape(author, quote=True)}"}},'
            f'"datePublished":"{published}",'
            f'"dateModified":"{published}",'
            f'"mainEntityOfPage":{{"@type":"WebPage","@id":"{canonical}"}},'
            f'"publisher":{{"@type":"Organization","name":"AI Tools Hub"}}'
            '}'
        )
        doc = upsert_jsonld(doc, "article", article_schema)
    else:
        website_schema = (
            '{'
            '"@context":"https://schema.org",'
            '"@type":"WebSite",'
            '"name":"AI Tools Hub",'
            f'"url":"{SITE_URL}/",'
            '"potentialAction":{' 
            '"@type":"SearchAction",'
            f'"target":"{SITE_URL}/?q={{search_term_string}}",'
            '"query-input":"required name=search_term_string"'
            '}'
            '}'
        )
        doc = upsert_jsonld(doc, "website", website_schema)

    if doc != original:
        write(path, doc)
        return True, "updated"
    return False, "no change"


def rebuild_sitemap():
    files = []
    for p in ROOT_PAGES:
        f = os.path.join(BASE_DIR, p)
        if os.path.exists(f):
            files.append((f, 1.0 if p == "index.html" else 0.5, "monthly" if p != "index.html" else "weekly"))
    for fn in sorted(os.listdir(ARTICLES_DIR)):
        if fn.endswith(".html"):
            files.append((os.path.join(ARTICLES_DIR, fn), 0.8, "weekly"))

    today = datetime.utcnow().date().isoformat()
    lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for fpath, prio, freq in files:
        rel = os.path.relpath(fpath, BASE_DIR).replace("\\", "/")
        loc = SITE_URL + ("/" if rel == "index.html" else f"/{rel}")
        lines += [
            "  <url>",
            f"    <loc>{loc}</loc>",
            f"    <lastmod>{today}</lastmod>",
            f"    <changefreq>{freq}</changefreq>",
            f"    <priority>{prio:.1f}</priority>",
            "  </url>",
        ]
    lines.append("</urlset>")
    write(os.path.join(BASE_DIR, "sitemap.xml"), "\n".join(lines) + "\n")


def update_robots():
    robots_path = os.path.join(BASE_DIR, "robots.txt")
    content = (
        "User-agent: *\n"
        "Allow: /\n"
        "Disallow: /admin/\n"
        "Disallow: /private/\n"
        "Disallow: /search?\n"
        "Disallow: /*.json$\n\n"
        "Sitemap: https://aitoolshub.com/sitemap.xml\n"
    )
    write(robots_path, content)


def main():
    updated = 0
    scanned = 0

    for page in ROOT_PAGES:
        p = os.path.join(BASE_DIR, page)
        if os.path.exists(p):
            scanned += 1
            ch, _ = process_file(p, is_article=False)
            updated += int(ch)

    for fn in sorted(os.listdir(ARTICLES_DIR)):
        if not fn.endswith('.html'):
            continue
        p = os.path.join(ARTICLES_DIR, fn)
        scanned += 1
        ch, _ = process_file(p, is_article=True)
        updated += int(ch)

    rebuild_sitemap()
    update_robots()

    print(f"Scanned: {scanned}")
    print(f"Updated: {updated}")
    print("Also rebuilt sitemap.xml and robots.txt")


if __name__ == '__main__':
    main()
