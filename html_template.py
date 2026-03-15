#!/usr/bin/env python3
"""HTML template for article generation."""

def get_html(slug, title, description, focus_kw, tools, category, niche,
             pub_date, mod_date, images, read_time,
             intro, context, criteria, reviews, comparison,
             implementation, takeaways, expert_quote, conclusion,
             faq_html, faq_schema_items):
    """Return complete HTML article string."""
    
    tools_lower = ', '.join(tools[:3]).lower()
    
    # Build article schema
    article_schema = f'''{{
  "@type": "Article",
  "@id": "https://aitoolshub.com/articles/{slug}.html#article",
  "headline": "{title}",
  "description": "{description}",
  "image": "{images[0]}",
  "datePublished": "{pub_date}",
  "dateModified": "{mod_date}",
  "author": {{
    "@type": "Person",
    "name": "Sarah Mitchell",
    "url": "https://aitoolshub.com/about.html",
    "jobTitle": "Small Business Owner & AI Tools Reviewer"
  }},
  "publisher": {{
    "@type": "Organization",
    "name": "AI Tools Hub",
    "url": "https://aitoolshub.com",
    "logo": {{"@type": "ImageObject", "url": "https://aitoolshub.com/favicon.svg"}}
  }},
  "mainEntityOfPage": {{
    "@type": "WebPage",
    "@id": "https://aitoolshub.com/articles/{slug}.html"
  }},
  "wordCount": "1200",
  "articleSection": "{category}",
  "keywords": "{focus_kw}"
}}'''

    breadcrumb_schema = f'''{{
  "@type": "BreadcrumbList",
  "itemListElement": [
    {{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://aitoolshub.com/"}},
    {{"@type": "ListItem", "position": 2, "name": "{category}", "item": "https://aitoolshub.com/?category={category.replace(' ', '+')}"}},
    {{"@type": "ListItem", "position": 3, "name": "{title[:60]}", "item": "https://aitoolshub.com/articles/{slug}.html"}}
  ]
}}'''

    faq_schema = '{"@type": "FAQPage", "mainEntity": [' + ','.join(faq_schema_items) + ']}'
    
    full_schema = '{"@context":"https://schema.org","@graph":[' + article_schema + ',' + breadcrumb_schema + ',' + faq_schema + ']}'

    return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} | AI Tools Hub</title>
    <meta name="description" content="{description}">
    <meta name="keywords" content="{focus_kw}, {tools_lower}, best {niche} tools 2026">
    <meta name="author" content="Sarah Mitchell">
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
    <link rel="canonical" href="https://aitoolshub.com/articles/{slug}">
    <meta property="og:type" content="article">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{description}">
    <meta property="og:url" content="https://aitoolshub.com/articles/{slug}.html">
    <meta property="og:image" content="{images[0]}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="AI Tools Hub">
    <meta property="og:locale" content="en_US">
    <meta property="article:published_time" content="{pub_date}">
    <meta property="article:modified_time" content="{mod_date}">
    <meta property="article:section" content="{category}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{title}">
    <meta name="twitter:description" content="{description}">
    <meta name="twitter:image" content="{images[0]}">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com">
    <link rel="stylesheet" href="../style.css">
    <script type="application/ld+json">{full_schema}</script>
</head>
<body>
    <header>
        <nav class="container">
            <a href="/" class="logo">🤖 AI Tools Hub</a>
            <div class="nav-links">
                <a href="/">Home</a>
                <a href="/about.html">About</a>
                <a href="/contact.html">Contact</a>
            </div>
        </nav>
    </header>
    <main class="container">
        <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="/">Home</a> &raquo; <a href="/?category={category.replace(' ', '+')}">{category}</a> &raquo; <span>{title[:50]}...</span>
        </nav>
        <article>
            <header class="article-header">
                <span class="category-badge">{category}</span>
                <h1>{title}</h1>
                <div class="article-meta">
                    <span class="author">By <strong>Sarah Mitchell</strong></span>
                    <time datetime="{pub_date}">Published {pub_date}</time>
                    <span class="read-time">{read_time} min read</span>
                </div>
                <img src="{images[0]}" alt="{title} - hero image" width="1200" height="630" class="hero-image">
            </header>
            <div class="article-body">
                <p><strong>{intro}</strong></p>
                <p>{context}</p>
                {criteria}
                {reviews}
                {comparison}
                {implementation}
                {takeaways}
                {expert_quote}
                <h2>Final Verdict</h2>
                <p>{conclusion}</p>
                {faq_html}
                <div class="author-box">
                    <img src="https://source.unsplash.com/100x100/?professional,woman&sig=sarah-mitchell" alt="Sarah Mitchell" width="80" height="80" loading="lazy">
                    <div>
                        <strong>Sarah Mitchell</strong>
                        <p>Small business owner and AI tools reviewer. I test AI tools in real business scenarios so you do not have to waste time on solutions that underdeliver. Follow my reviews for honest, data-backed recommendations.</p>
                    </div>
                </div>
            </div>
        </article>
    </main>
    <footer>
        <div class="container">
            <p>&copy; 2026 AI Tools Hub. All rights reserved.</p>
            <nav>
                <a href="/privacy.html">Privacy</a>
                <a href="/disclosure.html">Disclosure</a>
                <a href="/disclaimer.html">Disclaimer</a>
            </nav>
        </div>
    </footer>
</body>
</html>'''
