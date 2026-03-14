#!/usr/bin/env python3
"""
Internal Linking System for AI Tools Hub
Builds related article links across all 372 articles for SEO.
"""

import os
import re
import json
import math
from collections import Counter, defaultdict
from html.parser import HTMLParser

ARTICLES_DIR = "/data/.openclaw/workspace/adsense-site/articles"
STYLE_CSS = "/data/.openclaw/workspace/adsense-site/style.css"
LINK_MAP_PATH = "/data/.openclaw/workspace/adsense-site/INTERNAL_LINKS_MAP.md"

# ─── Step 1: Parse all articles ──────────────────────────────────────────

class ArticleParser(HTMLParser):
    """Extract title, description, keywords, and category from article HTML."""
    def __init__(self):
        super().__init__()
        self.title = ""
        self.description = ""
        self.keywords = []
        self.category = ""
        self.in_title = False
        self.h1_text = ""
        self.in_h1 = False
        self.first_p = ""
        self.in_article_p = False
        self.p_count = 0
        self.in_article = False

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == "title":
            self.in_title = True
        elif tag == "h1":
            self.in_h1 = True
        elif tag == "article":
            self.in_article = True
        elif tag == "p" and self.in_article and self.p_count < 1:
            self.in_article_p = True
        elif tag == "meta":
            name = attrs_dict.get("name", "").lower()
            prop = attrs_dict.get("property", "").lower()
            content = attrs_dict.get("content", "")
            if name == "description":
                self.description = content
            elif name == "keywords":
                self.keywords = [k.strip().lower() for k in content.split(",") if k.strip()]
            elif prop == "article:section":
                self.category = content

    def handle_data(self, data):
        if self.in_title:
            self.title += data
        if self.in_h1:
            self.h1_text += data
        if self.in_article_p:
            self.first_p += data

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        elif tag == "h1":
            self.in_h1 = False
        elif tag == "p" and self.in_article_p:
            self.in_article_p = False
            self.p_count += 1
        elif tag == "article":
            self.in_article = False


def extract_keywords_from_text(text):
    """Extract meaningful keywords from title/description text."""
    stop_words = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
        'before', 'after', 'above', 'below', 'between', 'out', 'off', 'over',
        'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when',
        'where', 'why', 'how', 'all', 'both', 'each', 'few', 'more', 'most',
        'other', 'some', 'such', 'no', 'not', 'only', 'own', 'same', 'so',
        'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now', 'also',
        'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us',
        'them', 'my', 'your', 'his', 'its', 'our', 'their', 'this', 'that',
        'these', 'those', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'would',
        'could', 'might', 'must', 'shall', 'need', 'dare', 'ought', 'used',
        'what', 'which', 'who', 'whom', 'whose', 'if', 'unless', 'until',
        'while', 'as', 'because', 'since', 'although', 'though', 'even',
        'vs', 'vs.', 'best', 'top', 'new', 'really', 'actually', 'get',
        'use', 'using', 'make', 'one', 'two', 'three', 'way', 'ways',
        'like', 'know', 'see', 'look', 'find', 'give', 'tell', 'think',
        'come', 'go', 'take', 'want', 'let', 'still', 'every', 'much',
        'any', 'may', 'well', 'work', 'works', 'working', 'help', 'helps',
        'first', 'right', 'big', 'small', 'long', 'great', 'good', 'old',
        'able', 'don', 'doesn', 'didn', 'won', 'wouldn', 'couldn', 'shouldn',
        'haven', 'hasn', 'hadn', 'isn', 'aren', 'wasn', 'weren',
        'guide', 'review', 'complete', 'ultimate', 'honest', 'compared',
        'comparison', 'part', '2026', '2025', '2024'
    }
    words = re.findall(r'[a-z]+', text.lower())
    return [w for w in words if w not in stop_words and len(w) > 2]


def extract_topic_tags(filename, title, keywords, description, category):
    """
    Extract broader topic tags for grouping articles.
    Returns a set of topic tags.
    """
    tags = set()
    combined = f"{filename} {title} {' '.join(keywords)} {description} {category}".lower()

    # Industry/use-case topics
    topic_patterns = {
        'automation': r'automat|workflow|zapier|make\.com|n8n|integrat',
        'content-creation': r'content.creat|writing|copywriting|blog|article|jasper|copy\.ai',
        'marketing': r'market|advertis|campaign|social.media|seo|email.market|brand',
        'ecommerce': r'e.?commerce|shopify|amazon|product|retail|store|shop|dropship',
        'business': r'small.business|entrepreneur|startup|solopreneur|business',
        'productivity': r'productiv|time.sav|efficien|organiz|project.manage|notion|task',
        'customer-service': r'customer.service|support|chatbot|help.desk|crm|zendesk|intercom',
        'developers': r'develop|coding|code|programming|software|api|github|developer',
        'design': r'design|graphic|image|photo|video|visual|creative|canva|figma|midjourney',
        'data-analytics': r'data|analytics|analys|dashboard|report|insight|spreadsheet',
        'finance': r'financ|account|budget|tax|invoic|payment|bookkeep',
        'healthcare': r'health|medical|patient|clinical|telemedicine|wellness',
        'education': r'educat|teach|learn|student|course|training|tutor',
        'real-estate': r'real.estate|property|housing|mortgage|rental',
        'legal': r'legal|law|contract|compliance|attorney|lawyer',
        'hr': r'human.resource|hr|recruit|hiring|talent|employee|staffing',
        'ai-general': r'\bai\b|artificial.intelligence|machine.learning|deep.learning|neural|gpt|llm|claude|chatgpt|gemini',
        'chatgpt': r'chatgpt|openai|gpt.?[34]|gpt.?5',
        'claude': r'claude|anthropic',
        'video': r'video|youtube|tiktok|streaming|editing|transcri',
        'audio': r'audio|voice|speech|podcast|music|text.to.speech|transcri',
        'security': r'secur|privacy|protect|cyber|threat|encrypt',
        'consulting': r'consult|advisor|freelanc|agency|professional.service',
        'manufacturing': r'manufactur|supply.chain|logistics|warehouse|inventory',
        'nonprofit': r'nonprofit|non.profit|charity|donation|volunteer',
        'restaurants': r'restaurant|food.service|catering|menu|dining',
        'events': r'event|conference|meeting|webinar|planning',
        'writing': r'writ|grammar|proofread|grammarly|copy|edit',
        'presentations': r'presentation|slide|pitch|deck|powerpoint',
        'spreadsheets': r'spreadsheet|excel|google.sheet|formula|pivot',
        'crm': r'crm|customer.relationship|hubspot|salesforce|pipedrive',
        'project-management': r'project.manage|asana|trello|monday|clickup|jira',
        'email': r'email|inbox|newsletter|outreach|mailchimp',
        'seo': r'\bseo\b|search.engine|keyword|ranking|organic|backlink',
        'social-media': r'social.media|instagram|twitter|linkedin|facebook|tiktok',
        'competitor-analysis': r'competitor|competitive|market.research|benchmark',
        'cost-saving': r'cost|pric|budget|sav|afford|cheap|expensive|roi|free',
        'website-building': r'website|web.?site|landing.page|wordpress|wix|squarespace|webflow|no.?code',
    }

    for tag, pattern in topic_patterns.items():
        if re.search(pattern, combined):
            tags.add(tag)

    return tags


def parse_articles():
    """Parse all article HTML files and return structured data."""
    articles = {}
    files = sorted([f for f in os.listdir(ARTICLES_DIR) if f.endswith('.html')])

    for fname in files:
        filepath = os.path.join(ARTICLES_DIR, fname)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                html = f.read()
        except Exception as e:
            print(f"  ⚠ Error reading {fname}: {e}")
            continue

        parser = ArticleParser()
        try:
            parser.feed(html)
        except Exception as e:
            print(f"  ⚠ Error parsing {fname}: {e}")
            continue

        title = parser.title.strip() or parser.h1_text.strip() or fname.replace('.html', '').replace('-', ' ').title()

        # Clean title - remove site name suffix
        title = re.sub(r'\s*[|·–—-]\s*AI Tools Hub\s*$', '', title).strip()

        meta_keywords = parser.keywords
        text_keywords = extract_keywords_from_text(f"{title} {parser.description}")
        all_keywords = list(set(meta_keywords + text_keywords))

        topic_tags = extract_topic_tags(fname, title, all_keywords, parser.description, parser.category)

        excerpt = parser.first_p.strip()
        if not excerpt:
            excerpt = parser.description
        # Truncate excerpt
        if len(excerpt) > 120:
            excerpt = excerpt[:117].rsplit(' ', 1)[0] + '...'

        articles[fname] = {
            'title': title,
            'description': parser.description,
            'keywords': all_keywords,
            'category': parser.category,
            'topic_tags': topic_tags,
            'excerpt': excerpt,
            'filepath': filepath,
        }

    return articles


# ─── Step 2: Compute similarity and find related articles ────────────────

def compute_related(articles, min_links=3, max_links=5):
    """
    Compute related articles for each article using multi-signal similarity:
    - Topic tag overlap (strongest signal)
    - Keyword overlap
    - Filename pattern matching (for series/parts)
    - Category matching
    """
    filenames = list(articles.keys())
    n = len(filenames)

    # Build IDF for keywords
    doc_freq = Counter()
    for data in articles.values():
        unique_kw = set(data['keywords'])
        for kw in unique_kw:
            doc_freq[kw] += 1

    def idf(term):
        df = doc_freq.get(term, 0)
        if df == 0:
            return 0
        return math.log(n / df)

    # Detect series (e.g., "ai-tools-for-developers-2026-part-2.html")
    series_map = defaultdict(list)
    for fname in filenames:
        base = re.sub(r'-part-\d+', '', fname.replace('.html', ''))
        series_map[base].append(fname)

    related_map = {}

    for i, fname in enumerate(filenames):
        art = articles[fname]
        scores = []

        # Get series siblings
        base = re.sub(r'-part-\d+', '', fname.replace('.html', ''))
        series_siblings = set(series_map.get(base, [])) - {fname}

        for j, other_fname in enumerate(filenames):
            if i == j:
                continue

            other = articles[other_fname]
            score = 0.0

            # 1. Topic tag overlap (weight: 3.0 per shared tag)
            shared_tags = art['topic_tags'] & other['topic_tags']
            score += len(shared_tags) * 3.0

            # 2. Keyword overlap with IDF weighting
            kw_set_a = set(art['keywords'])
            kw_set_b = set(other['keywords'])
            shared_kw = kw_set_a & kw_set_b
            for kw in shared_kw:
                score += idf(kw) * 0.5

            # 3. Category match bonus
            if art['category'] and art['category'] == other['category']:
                score += 2.0

            # 4. Series bonus (strong connection)
            if other_fname in series_siblings:
                score += 10.0

            # 5. Filename similarity bonus (slug-based)
            slug_a = fname.replace('.html', '').split('-')
            slug_b = other_fname.replace('.html', '').split('-')
            slug_overlap = len(set(slug_a) & set(slug_b) - {'ai', 'tools', 'for', 'the', '2026', '2025', '2024', 'part', 'vs', 'best', 'top', 'how', 'to', 'and', 'a', 'an'})
            score += slug_overlap * 0.5

            if score > 0:
                scores.append((other_fname, score))

        # Sort by score descending
        scores.sort(key=lambda x: -x[1])

        # Pick top related, ensuring diversity (no more than 2 from same series)
        selected = []
        series_count = Counter()

        for other_fname, sc in scores:
            if len(selected) >= max_links:
                break
            other_base = re.sub(r'-part-\d+', '', other_fname.replace('.html', ''))
            if series_count[other_base] >= 2 and other_base == base:
                continue
            selected.append(other_fname)
            series_count[other_base] += 1

        # Ensure minimum links
        if len(selected) < min_links:
            # Add more by simple tag overlap
            for other_fname, sc in scores:
                if other_fname not in selected:
                    selected.append(other_fname)
                if len(selected) >= min_links:
                    break

        related_map[fname] = selected[:max_links]

        if (i + 1) % 50 == 0:
            print(f"  Computed related for {i+1}/{n} articles...")

    return related_map


# ─── Step 3: Inject related articles HTML ────────────────────────────────

RELATED_CSS = """
/* ─── Related Articles Section ─── */
.related-articles {
  margin: 3rem 0 2rem;
  padding: 2rem 0 0;
  border-top: 2px solid #e5e7eb;
}
.related-articles h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1.25rem;
}
.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
}
.related-card {
  display: block;
  padding: 1.25rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
}
.related-card:hover {
  border-color: #6366f1;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.12);
  transform: translateY(-2px);
}
.related-card h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem;
  line-height: 1.4;
}
.related-card p {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}
"""


def build_related_html(fname, related_fnames, articles):
    """Build the related articles HTML section."""
    cards = []
    for rel_fname in related_fnames:
        rel = articles[rel_fname]
        title_escaped = rel['title'].replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')
        excerpt_escaped = rel['excerpt'].replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')
        if not excerpt_escaped:
            excerpt_escaped = "Discover more insights on AI tools and automation."
        cards.append(f'''      <a href="{rel_fname}" class="related-card">
        <h3>{title_escaped}</h3>
        <p>{excerpt_escaped}</p>
      </a>''')

    cards_html = "\n".join(cards)
    return f'''
<section class="related-articles">
  <h2>You Might Also Like</h2>
  <div class="related-grid">
{cards_html}
  </div>
</section>
'''


def inject_related_sections(articles, related_map):
    """Inject related articles HTML into each article file."""
    count = 0
    errors = 0

    for fname, related_fnames in related_map.items():
        filepath = articles[fname]['filepath']

        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                html = f.read()
        except Exception as e:
            print(f"  ⚠ Error reading {fname}: {e}")
            errors += 1
            continue

        # Build the related section
        related_html = build_related_html(fname, related_fnames, articles)

        # Insert before the footer
        # Try multiple insertion points
        inserted = False

        # Strategy 1: Before <footer
        footer_match = re.search(r'(\n*<footer\s)', html)
        if footer_match:
            insert_pos = footer_match.start()
            html = html[:insert_pos] + related_html + html[insert_pos:]
            inserted = True

        # Strategy 2: Before </body>
        if not inserted:
            body_match = re.search(r'(\n*</body>)', html, re.IGNORECASE)
            if body_match:
                insert_pos = body_match.start()
                html = html[:insert_pos] + related_html + html[insert_pos:]
                inserted = True

        # Strategy 3: Before </html>
        if not inserted:
            html_match = re.search(r'(\n*</html>)', html, re.IGNORECASE)
            if html_match:
                insert_pos = html_match.start()
                html = html[:insert_pos] + related_html + html[insert_pos:]
                inserted = True

        if not inserted:
            print(f"  ⚠ Could not find insertion point in {fname}")
            errors += 1
            continue

        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(html)
            count += 1
        except Exception as e:
            print(f"  ⚠ Error writing {fname}: {e}")
            errors += 1

        if (count + errors) % 50 == 0:
            print(f"  Injected into {count}/{len(related_map)} articles...")

    return count, errors


# ─── Step 4: Add CSS to style.css ────────────────────────────────────────

def add_css():
    """Add related articles CSS to the main style.css."""
    try:
        with open(STYLE_CSS, 'r', encoding='utf-8') as f:
            css = f.read()
    except Exception as e:
        print(f"  ⚠ Error reading style.css: {e}")
        return False

    if '.related-articles' in css:
        print("  CSS already contains related-articles styles, skipping.")
        return True

    css += "\n" + RELATED_CSS

    try:
        with open(STYLE_CSS, 'w', encoding='utf-8') as f:
            f.write(css)
        return True
    except Exception as e:
        print(f"  ⚠ Error writing style.css: {e}")
        return False


# ─── Step 5: Generate link map report ────────────────────────────────────

def generate_link_map(articles, related_map):
    """Generate the INTERNAL_LINKS_MAP.md report."""
    lines = []
    lines.append("# Internal Links Map — AI Tools Hub")
    lines.append("")
    lines.append(f"**Generated:** 2026-03-14")
    lines.append(f"**Total Articles:** {len(articles)}")
    lines.append(f"**Articles with Related Links:** {len(related_map)}")
    lines.append("")

    # Stats
    link_counts = [len(v) for v in related_map.values()]
    total_links = sum(link_counts)
    avg_links = total_links / len(link_counts) if link_counts else 0
    min_links = min(link_counts) if link_counts else 0
    max_links_val = max(link_counts) if link_counts else 0

    lines.append("## Summary Statistics")
    lines.append("")
    lines.append(f"| Metric | Value |")
    lines.append(f"|--------|-------|")
    lines.append(f"| Total internal links created | {total_links} |")
    lines.append(f"| Average links per article | {avg_links:.1f} |")
    lines.append(f"| Minimum links per article | {min_links} |")
    lines.append(f"| Maximum links per article | {max_links_val} |")
    lines.append(f"| Articles with ≥3 links | {sum(1 for c in link_counts if c >= 3)} |")
    lines.append("")

    # Categorize by topic
    topic_counts = Counter()
    for data in articles.values():
        for tag in data['topic_tags']:
            topic_counts[tag] += 1

    lines.append("## Topic Distribution")
    lines.append("")
    lines.append("| Topic | Articles |")
    lines.append("|-------|----------|")
    for topic, count in topic_counts.most_common(30):
        lines.append(f"| {topic} | {count} |")
    lines.append("")

    # Inbound link counts (which articles are linked TO the most)
    inbound = Counter()
    for fname, related in related_map.items():
        for r in related:
            inbound[r] += 1

    lines.append("## Most Linked-To Articles (Top 30)")
    lines.append("")
    lines.append("| # | Article | Inbound Links |")
    lines.append("|---|---------|---------------|")
    for i, (fname, count) in enumerate(inbound.most_common(30)):
        title = articles[fname]['title'][:60]
        lines.append(f"| {i+1} | {title} | {count} |")
    lines.append("")

    # Full link map
    lines.append("## Full Link Map")
    lines.append("")

    # Group by category
    by_category = defaultdict(list)
    for fname in sorted(related_map.keys()):
        cat = articles[fname].get('category', 'Uncategorized') or 'Uncategorized'
        by_category[cat].append(fname)

    for cat in sorted(by_category.keys()):
        lines.append(f"### {cat}")
        lines.append("")
        for fname in by_category[cat]:
            title = articles[fname]['title']
            related = related_map[fname]
            lines.append(f"**{title}** (`{fname}`)")
            for r in related:
                r_title = articles[r]['title']
                lines.append(f"  → [{r_title}]({r})")
            lines.append("")

    report = "\n".join(lines)
    with open(LINK_MAP_PATH, 'w', encoding='utf-8') as f:
        f.write(report)

    return total_links


# ─── Main ────────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("🔗 AI Tools Hub — Internal Linking System Builder")
    print("=" * 60)

    print("\n📖 Step 1: Parsing all articles...")
    articles = parse_articles()
    print(f"  ✅ Parsed {len(articles)} articles")

    print("\n🧮 Step 2: Computing related articles...")
    related_map = compute_related(articles)
    print(f"  ✅ Computed related links for {len(related_map)} articles")

    # Verify minimum links
    under_min = sum(1 for v in related_map.values() if len(v) < 3)
    if under_min:
        print(f"  ⚠ {under_min} articles have fewer than 3 related links")

    print("\n🎨 Step 3: Adding CSS to style.css...")
    if add_css():
        print("  ✅ CSS added to style.css")

    print("\n💉 Step 4: Injecting related articles sections...")
    count, errors = inject_related_sections(articles, related_map)
    print(f"  ✅ Injected related sections into {count} articles ({errors} errors)")

    print("\n📊 Step 5: Generating link map report...")
    total = generate_link_map(articles, related_map)
    print(f"  ✅ Link map saved to INTERNAL_LINKS_MAP.md ({total} total links)")

    print("\n" + "=" * 60)
    print("✅ INTERNAL LINKING COMPLETE!")
    print(f"   • {len(articles)} articles processed")
    print(f"   • {count} articles updated with related links")
    print(f"   • {total} total internal links created")
    print(f"   • Average {total/len(articles):.1f} links per article")
    print("=" * 60)


if __name__ == "__main__":
    main()
