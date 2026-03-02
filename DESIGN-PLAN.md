# AI Tools Hub — Complete Layout Redesign Plan

## Executive Summary

The site currently has **three distinct page types** but they're insufficiently differentiated:
- `index.html` (Home) — Blog showcase with hero + featured post + grid + sidebar ✅ Good foundation
- `resources.html` (Resources) — Tool directory, but uses inline styles and no unique layout identity ❌ Needs major work
- `articles/*.html` (Article Detail) — Proper article layout with sidebar ✅ Good, needs polish

**Core Problem:** Home and Resources pages lack visual/structural differentiation. Resources uses inline styles instead of CSS classes, has no sidebar, no search, and no category filtering. There are also **zero media queries** in the entire CSS — the site is NOT mobile responsive.

---

## Table of Contents

1. [Home Page Layout (Redesigned)](#1-home-page-layout)
2. [Resources/Category Page Layout (New Design)](#2-resourcescategory-page-layout)
3. [Article Detail Page (Optimized)](#3-article-detail-page)
4. [New CSS Classes & Variables](#4-new-css-classes--variables)
5. [Responsive Breakpoints (CRITICAL — Currently Missing)](#5-responsive-breakpoints)
6. [Implementation Guide (Step-by-Step)](#6-implementation-guide)

---

## 1. Home Page Layout

### Purpose
Magazine-style blog homepage that showcases trending content, builds trust, and drives newsletter signups.

### Current State
Already has a good structure: Hero → Featured Post → Post Grid → Sidebar. But needs refinement.

### Visual Layout (Desktop — 1200px max)

```
┌─────────────────────────────────────────────────────────────┐
│  STICKY HEADER: Logo | Home About Categories Resources Contact | Newsletter CTA  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  HERO SECTION (full-width, white gradient, centered)        │
│  "AI Tools That Actually Work for Real Small Business"      │
│  Subtitle + Trust Badges (30+ tools, 12 months, etc.)      │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  AD ZONE: 728×90 Leaderboard                                │
├──────────────────────────────────────┬──────────────────────┤
│                                      │                      │
│  ⭐ EDITOR'S PICK                    │  SIDEBAR             │
│  ┌──────────┬───────────────────┐    │  ┌──────────────┐   │
│  │  IMAGE   │  Featured Content │    │  │ About Sarah  │   │
│  │  (50%)   │  Title + Excerpt  │    │  │ Photo + Bio  │   │
│  │          │  Author + CTA     │    │  └──────────────┘   │
│  └──────────┴───────────────────┘    │  ┌──────────────┐   │
│                                      │  │ Search Box   │   │
│  LATEST POSTS                        │  └──────────────┘   │
│  ┌────────┐ ┌────────┐ ┌────────┐   │  ┌──────────────┐   │
│  │ Card 1 │ │ Card 2 │ │ Card 3 │   │  │ Categories   │   │
│  │ IMG    │ │ IMG    │ │ IMG    │   │  │ with counts  │   │
│  │ Title  │ │ Title  │ │ Title  │   │  └──────────────┘   │
│  │ Excerpt│ │ Excerpt│ │ Excerpt│   │  ┌──────────────┐   │
│  └────────┘ └────────┘ └────────┘   │  │ Ad 300×250   │   │
│                                      │  └──────────────┘   │
│  [In-Feed Ad]                        │  ┌──────────────┐   │
│                                      │  │ Recent Posts  │   │
│  ┌────────┐ ┌────────┐ ┌────────┐   │  │ Thumbnails   │   │
│  │ Card 4 │ │ Card 5 │ │ Card 6 │   │  └──────────────┘   │
│  └────────┘ └────────┘ └────────┘   │  ┌──────────────┐   │
│                                      │  │ 📧 Newsletter│   │
│  🔥 MOST POPULAR                     │  │ Email + CTA  │   │
│  1. Article title...                 │  └──────────────┘   │
│  2. Article title...                 │                      │
│  3. Article title...                 │                      │
│                                      │                      │
│  ╔══════════════════════════════╗     │                      │
│  ║  📧 NEWSLETTER CTA BANNER  ║     │                      │
│  ║  Full-width, blue gradient  ║     │                      │
│  ║  Email input + Subscribe    ║     │                      │
│  ╚══════════════════════════════╝     │                      │
│                                      │                      │
├──────────────────────────────────────┴──────────────────────┤
│  FOOTER: Brand | Top Reviews | Popular Guides | Site Links  │
│  © 2026 AI Tools Hub                                        │
└─────────────────────────────────────────────────────────────┘
```

### Changes Needed for Home Page

#### A. Add a full-width Newsletter CTA Banner (NEW)
After the "Most Popular" section, before the footer, add a full-width newsletter CTA to maximize conversions.

**New HTML to add** (inside `<main>`, after the Popular Posts section):

```html
<!-- NEWSLETTER CTA BANNER (Full-width in main column) -->
<section class="newsletter-banner" id="newsletter-main">
  <div class="newsletter-banner-inner">
    <div class="newsletter-banner-text">
      <h3>📧 Get the Weekly AI Tools Briefing</h3>
      <p>Every Tuesday: One AI tool worth your time, one workflow tip, one thing to skip. Join 2,400+ small business owners.</p>
    </div>
    <form class="newsletter-banner-form">
      <input type="email" placeholder="your@email.com" required>
      <button type="submit">Subscribe Free →</button>
    </form>
  </div>
</section>
```

#### B. Add "Browse by Category" section (NEW)
After the post grids, add a visual category browser to improve internal linking and differentiate from the resources page.

**New HTML:**

```html
<!-- BROWSE BY CATEGORY -->
<section class="category-browse" id="categories">
  <div class="section-header">
    <h2 class="section-title">Browse by <span>Category</span></h2>
    <a href="resources.html" class="view-all-link">All resources →</a>
  </div>
  <div class="category-cards-grid">
    <a href="resources.html?cat=reviews" class="category-card">
      <span class="category-card-icon">🛠️</span>
      <h4>AI Tools Reviews</h4>
      <span class="category-card-count">12 articles</span>
    </a>
    <a href="resources.html?cat=comparisons" class="category-card">
      <span class="category-card-icon">⚖️</span>
      <h4>Comparisons</h4>
      <span class="category-card-count">8 articles</span>
    </a>
    <a href="resources.html?cat=guides" class="category-card">
      <span class="category-card-icon">📖</span>
      <h4>How-To Guides</h4>
      <span class="category-card-count">10 articles</span>
    </a>
    <a href="resources.html?cat=automation" class="category-card">
      <span class="category-card-icon">🔄</span>
      <h4>Automation</h4>
      <span class="category-card-count">6 articles</span>
    </a>
    <a href="resources.html?cat=productivity" class="category-card">
      <span class="category-card-icon">📈</span>
      <h4>Productivity</h4>
      <span class="category-card-count">8 articles</span>
    </a>
    <a href="resources.html?cat=creativity" class="category-card">
      <span class="category-card-icon">🎨</span>
      <h4>AI & Creativity</h4>
      <span class="category-card-count">5 articles</span>
    </a>
  </div>
</section>
```

#### C. No other structural changes to Home
The existing Hero, Featured Post, Post Grid, Popular Posts, and Sidebar are already well-designed. Keep them as-is.

---

## 2. Resources/Category Page Layout

### Purpose
Tool directory + article browser organized by category. This is the "library" of the site — functional, browsable, with search and filtering.

### Current State (PROBLEMS)
- Uses inline styles everywhere (no CSS classes)
- Has no sidebar
- Has no search or filtering
- Uses a flat `max-width:1000px` container instead of the site's grid system
- Resource cards have no proper CSS (`.resources-grid` and `.resource-card` are referenced but NOT defined in style.css!)
- Looks like a plain list, not a curated directory

### New Visual Layout (Desktop)

```
┌─────────────────────────────────────────────────────────────┐
│  STICKY HEADER (same as all pages)                           │
├─────────────────────────────────────────────────────────────┤
│  AD ZONE: 728×90 Leaderboard                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PAGE HEADER (full-width, light blue-gray gradient bg)      │
│  Breadcrumb: Home › Resources                               │
│  "Resources & AI Tool Directory"                            │
│  "Curated AI tools, platforms, and articles..."             │
│  ┌─────────────────────────────────────────────┐            │
│  │  🔍 Search resources and articles...        │            │
│  └─────────────────────────────────────────────┘            │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  CATEGORY FILTER BAR (horizontal pill buttons)              │
│  [All] [🤖 AI Tools] [🔄 Automation] [📚 Learning]         │
│  [📖 Articles] [⚖️ Comparisons] [📈 Productivity]          │
│                                                             │
├──────────────────────────────────────┬──────────────────────┤
│                                      │                      │
│  SECTION: 🤖 AI Tools I Use Daily   │  SIDEBAR             │
│  ┌────────┐ ┌────────┐ ┌────────┐   │  ┌──────────────┐   │
│  │ChatGPT │ │Claude  │ │Zapier  │   │  │ 📧 Newsletter│   │
│  │Icon    │ │Icon    │ │Icon    │   │  │ (Primary CTA)│   │
│  │Desc    │ │Desc    │ │Desc    │   │  └──────────────┘   │
│  │Price   │ │Price   │ │Price   │   │  ┌──────────────┐   │
│  └────────┘ └────────┘ └────────┘   │  │ 🔥 Popular   │   │
│  ┌────────┐ ┌────────┐ ┌────────┐   │  │ Articles     │   │
│  │Make    │ │Otter   │ │Notion  │   │  └──────────────┘   │
│  └────────┘ └────────┘ └────────┘   │  ┌──────────────┐   │
│  ┌────────┐ ┌────────┐ ┌────────┐   │  │ Ad 300×250   │   │
│  │MidJ    │ │Jasper  │ │Intrcm  │   │  └──────────────┘   │
│  └────────┘ └────────┘ └────────┘   │  ┌──────────────┐   │
│                                      │  │ Categories   │   │
│  SECTION: 🔄 Automation Tools       │  │ with counts  │   │
│  ┌────────┐ ┌────────┐ ┌────────┐   │  └──────────────┘   │
│  │Buffer  │ │Tidio   │ │HubSpot│   │  ┌──────────────┐   │
│  └────────┘ └────────┘ └────────┘   │  │ Affiliate    │   │
│                                      │  │ Disclosure   │   │
│  SECTION: 📚 Learning Resources     │  └──────────────┘   │
│  ┌────────┐ ┌────────┐ ┌────────┐   │                      │
│  └────────┘ └────────┘ └────────┘   │                      │
│                                      │                      │
│  AD ZONE: In-Feed                    │                      │
│                                      │                      │
│  SECTION: 📖 All Articles            │                      │
│  ┌────────┐ ┌────────┐ ┌────────┐   │                      │
│  │Article │ │Article │ │Article │   │                      │
│  │Card    │ │Card    │ │Card    │   │                      │
│  └────────┘ └────────┘ └────────┘   │                      │
│  ┌────────┐ ┌────────┐ ┌────────┐   │                      │
│  │Article │ │Article │ │Article │   │                      │
│  └────────┘ └────────┘ └────────┘   │                      │
│  (... show all 43 articles ...)      │                      │
│                                      │                      │
│  [Load More] or pagination           │                      │
│                                      │                      │
│  SECTION: 🌐 Find Me Online         │                      │
│  Social pills row                    │                      │
│                                      │                      │
├──────────────────────────────────────┴──────────────────────┤
│  FOOTER (same as all pages)                                  │
└─────────────────────────────────────────────────────────────┘
```

### Key Differences from Home Page

| Feature | Home Page | Resources Page |
|---------|-----------|----------------|
| **Hero** | Large hero with h1 + badges | Compact page header with search bar |
| **Featured Post** | Large 50/50 card | None — goes straight to grid |
| **Post Grid** | 3×2 curated cards (9 shown) | Full directory of ALL articles |
| **Category Filter** | Category cards linking to resources | Horizontal filter pills (interactive) |
| **Resource Cards** | None | Prominent tool cards with icons/prices |
| **Search** | Sidebar only | Full-width search in page header |
| **Sidebar** | About + Search + Categories + Recent + Newsletter | Newsletter (TOP) + Popular + Ad + Categories + Disclosure |
| **Visual Tone** | Editorial/magazine feel | Directory/library feel |
| **Background** | White | Light gray alt sections for visual rhythm |

### Complete HTML Structure for resources.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- ... existing meta tags ... -->
  <link rel="stylesheet" href="style.css">
</head>
<body>

<!-- SAME HEADER AS ALL PAGES -->
<header class="site-header">...</header>

<!-- TOP AD -->
<div class="container" style="margin-top: 20px;">
  <div class="ad-zone ad-leaderboard"><span>Advertisement</span></div>
</div>

<!-- PAGE HEADER (NEW — unique to resources page) -->
<section class="page-header">
  <div class="page-header-inner">
    <nav class="breadcrumb">
      <a href="index.html">Home</a><span class="sep">›</span><span>Resources</span>
    </nav>
    <h1 class="page-header-title">Resources & AI Tool Directory</h1>
    <p class="page-header-desc">A curated collection of AI tools, platforms, articles, and learning resources I actually use and trust. Updated regularly.</p>
    <div class="page-search">
      <input type="text" id="resource-search" placeholder="🔍 Search tools and articles..." autocomplete="off">
    </div>
  </div>
</section>

<!-- CATEGORY FILTER BAR (NEW) -->
<div class="container">
  <div class="filter-bar">
    <button class="filter-pill active" data-filter="all">All</button>
    <button class="filter-pill" data-filter="ai-tools">🤖 AI Tools</button>
    <button class="filter-pill" data-filter="automation">🔄 Automation</button>
    <button class="filter-pill" data-filter="learning">📚 Learning</button>
    <button class="filter-pill" data-filter="articles">📖 Articles</button>
    <button class="filter-pill" data-filter="comparisons">⚖️ Comparisons</button>
    <button class="filter-pill" data-filter="productivity">📈 Productivity</button>
  </div>
</div>

<!-- AFFILIATE DISCLOSURE (slim banner) -->
<div class="container">
  <div class="affiliate-disclosure">
    <strong>📣 Affiliate Disclosure:</strong> Some links are affiliate links. I may earn a commission at no extra cost to you. I only recommend tools I actually use. No sponsorships accepted.
  </div>
</div>

<!-- MAIN CONTENT WITH SIDEBAR -->
<div class="resources-layout">
  <main class="resources-main">

    <!-- AI Tools Section -->
    <section class="resource-section" data-category="ai-tools">
      <h2 class="resource-section-title">🤖 AI Tools I Use Daily</h2>
      <div class="resources-grid">
        <a href="https://chat.openai.com" target="_blank" rel="noopener" class="resource-card">
          <div class="resource-icon">🧠</div>
          <h4>ChatGPT Plus</h4>
          <p>My primary AI for writing, research, and brainstorming.</p>
          <span class="resource-price">$20/month</span>
        </a>
        <!-- ... more resource cards ... -->
      </div>
    </section>

    <!-- Automation Section -->
    <section class="resource-section" data-category="automation">
      <h2 class="resource-section-title">🔄 Automation & Productivity</h2>
      <div class="resources-grid">
        <!-- ... resource cards ... -->
      </div>
    </section>

    <!-- Learning Section -->
    <section class="resource-section" data-category="learning">
      <h2 class="resource-section-title">📚 Learning Resources</h2>
      <div class="resources-grid">
        <!-- ... resource cards ... -->
      </div>
    </section>

    <!-- In-Feed Ad -->
    <div class="ad-zone ad-in-article"><span>Advertisement — In-Feed Ad Unit</span></div>

    <!-- ALL ARTICLES Section (NEW — this is what makes it a "category page") -->
    <section class="resource-section" data-category="articles">
      <h2 class="resource-section-title">📖 All Articles</h2>
      <p class="resource-section-desc">Every review, comparison, and guide — organized by date.</p>
      <div class="articles-grid">
        <!-- Reuse .post-card from home page for visual consistency -->
        <div class="post-card">
          <div class="post-card-img-wrap">
            <img src="..." class="post-card-img" loading="lazy">
            <span class="post-card-category">Review</span>
          </div>
          <div class="post-card-body">
            <h3><a href="articles/...">Title</a></h3>
            <p class="post-excerpt">Excerpt...</p>
            <div class="post-meta-row">
              <span>Date</span>
              <span class="read-time">⏱ X min</span>
            </div>
          </div>
        </div>
        <!-- ... all 43 articles ... -->
      </div>
    </section>

    <!-- Social Section -->
    <section class="resource-section">
      <h2 class="resource-section-title">🌐 Find Me Online</h2>
      <div class="social-links-row">
        <a href="#" class="social-pill twitter">🐦 Twitter @sarahmitchellai</a>
        <a href="#" class="social-pill linkedin">in LinkedIn</a>
        <a href="#" class="social-pill youtube">▶️ YouTube (coming soon)</a>
      </div>
    </section>

  </main>

  <!-- SIDEBAR (different order than home page) -->
  <aside class="sidebar">
    <!-- Newsletter FIRST (primary CTA on resources page) -->
    <div class="sidebar-widget newsletter-widget" id="newsletter">
      <div class="widget-title">📧 Free Newsletter</div>
      <p class="newsletter-desc">Every Tuesday: One AI tool, one workflow tip, one thing to skip.</p>
      <form class="newsletter-form">
        <input type="email" placeholder="your@email.com">
        <button type="submit">Get Weekly Tips →</button>
      </form>
      <p class="newsletter-note">2,400+ subscribers. Join free.</p>
    </div>

    <!-- Popular Articles -->
    <div class="sidebar-widget">
      <div class="widget-title">🔥 Most Popular</div>
      <a href="articles/best-ai-tools-small-business.html" class="recent-post-item">
        <img src="..." class="recent-post-thumb">
        <div class="recent-post-info">
          <h4>7 Best AI Tools for Small Business</h4>
          <span class="recent-post-date">12.4K views</span>
        </div>
      </a>
      <!-- ... more popular items ... -->
    </div>

    <!-- Ad Zone -->
    <div class="sidebar-widget ad-widget">
      <span>Advertisement<br>300×250</span>
    </div>

    <!-- Categories Widget -->
    <div class="sidebar-widget">
      <div class="widget-title">Categories</div>
      <ul class="category-list">
        <li><a href="#ai-tools">🛠️ AI Tools Reviews</a><span class="cat-count">12</span></li>
        <li><a href="#comparisons">⚖️ Comparisons</a><span class="cat-count">8</span></li>
        <li><a href="#guides">📖 How-To Guides</a><span class="cat-count">10</span></li>
        <li><a href="#automation">🔄 Automation</a><span class="cat-count">6</span></li>
        <li><a href="#productivity">📈 Productivity</a><span class="cat-count">8</span></li>
        <li><a href="#creativity">🎨 AI & Creativity</a><span class="cat-count">5</span></li>
      </ul>
    </div>
  </aside>
</div>

<!-- FOOTER (same as all pages) -->
<footer class="site-footer">...</footer>

</body>
</html>
```

---

## 3. Article Detail Page

### Current State
Already well-structured with `.article-layout` grid (720px content + 330px sidebar). Has breadcrumb, category tag, title, meta bar, hero image, TOC, content, author box, related posts, and sidebar.

### Keep As-Is
- `.article-layout` grid
- `.article-main` content area
- Breadcrumb navigation
- Article header with category, title, meta
- Hero image with caption
- Table of contents
- Article content with typography
- Author box at bottom
- Related posts
- Sidebar with widgets

### Optimizations Needed

1. **Add "Back to Home" and "Back to Category" links** in breadcrumb (some articles link to `#` for category — should link to resources.html with category filter)

2. **Ensure consistent sidebar widgets** across all article pages:
   - Newsletter (top)
   - Table of Contents (sticky)
   - Ad Zone
   - Related Articles
   - Categories

3. **Add share buttons** that are properly styled (currently using `.share-btn` class which may not be defined)

4. **Document the article page classes** (see CSS section below)

---

## 4. New CSS Classes & Variables

### A. Page Header (Resources page unique component)

```css
/* ============================================
   PAGE HEADER — Resources/Category Pages
   ============================================ */

.page-header {
  background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 50%, #f0f4ff 100%);
  padding: 48px 0 40px;
  border-bottom: 1px solid var(--border);
  position: relative;
}

.page-header::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="rgba(59,130,246,0.06)"/></pattern></defs><rect width="1200" height="120" fill="url(%23dots)" /></svg>');
  opacity: 0.5;
}

.page-header-inner {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 1;
}

.page-header-title {
  font-family: var(--font-sans);
  font-size: 2.5rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 12px;
  letter-spacing: -0.3px;
}

.page-header-desc {
  font-size: 1.1rem;
  color: var(--text-light);
  line-height: 1.7;
  margin-bottom: 28px;
  max-width: 600px;
  font-family: var(--font-sans);
}

.page-search {
  max-width: 560px;
}

.page-search input {
  width: 100%;
  padding: 14px 20px;
  border: 2px solid var(--border);
  border-radius: 8px;
  font-size: 16px;
  color: var(--text);
  background: white;
  outline: none;
  font-family: var(--font-sans);
  transition: all var(--transition);
  box-shadow: var(--shadow-sm);
}

.page-search input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

.page-search input::placeholder {
  color: var(--text-muted);
}
```

### B. Filter Bar (Resources page)

```css
/* ============================================
   FILTER BAR — Category Filter Pills
   ============================================ */

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 24px 0;
  border-bottom: 1px solid var(--border-light);
  margin-bottom: 32px;
}

.filter-pill {
  padding: 8px 18px;
  border-radius: 20px;
  border: 1.5px solid var(--border);
  background: white;
  color: var(--text-light);
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: all var(--transition);
  white-space: nowrap;
}

.filter-pill:hover {
  border-color: var(--primary-light);
  color: var(--primary);
  background: #eff6ff;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}

.filter-pill.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
}
```

### C. Resources Layout (Grid with Sidebar)

```css
/* ============================================
   RESOURCES PAGE LAYOUT
   ============================================ */

.resources-layout {
  display: grid;
  grid-template-columns: 1fr var(--sidebar-width);
  gap: 40px;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 20px 56px;
  align-items: start;
}

.resources-main {
  min-width: 0;
}
```

### D. Resource Section Titles

```css
/* ============================================
   RESOURCE SECTIONS
   ============================================ */

.resource-section {
  margin-bottom: 48px;
}

.resource-section-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--border);
  font-family: var(--font-sans);
}

.resource-section-desc {
  font-size: 15px;
  color: var(--text-light);
  margin-bottom: 20px;
  margin-top: -8px;
  font-family: var(--font-sans);
}
```

### E. Resource Cards (Tool cards — currently UNDEFINED)

```css
/* ============================================
   RESOURCE CARDS (Tool Directory)
   ============================================ */

.resources-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.resource-card {
  display: flex;
  flex-direction: column;
  padding: 24px;
  background: white;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  text-decoration: none;
  color: var(--text