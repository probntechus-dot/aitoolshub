/**
 * Build comprehensive homepage with all 372 articles
 * Categories, search, pagination, responsive cards
 */
const fs = require('fs');
const path = require('path');

const articlesDir = './articles';
const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.html'));

const categoryKeywords = {
  'AI Writing': ['write', 'content', 'copy', 'blog', 'jasper', 'writesonic', 'grammarly'],
  'AI Design': ['design', 'image', 'midjourney', 'dalle', 'canva', 'photo', 'visual'],
  'AI Video': ['video', 'edit', 'filmmaking', 'youtube', 'clip'],
  'AI Code': ['develop', 'code', 'program', 'github', 'copilot', 'cursor', 'software'],
  'AI Marketing': ['market', 'seo', 'brand', 'social', 'ads', 'advertis'],
  'AI Automation': ['automat', 'zapier', 'make', 'workflow', 'n8n', 'integrat'],
  'AI Business': ['business', 'small-business', 'entrepreneur', 'solopreneur', 'startup', 'agency', 'consult'],
  'Industries': ['healthcare', 'real-estate', 'education', 'finance', 'ecommerce', 'restaurant', 'fitness', 'legal', 'account', 'photographer', 'event'],
  'Comparisons': ['vs', 'comparison', 'alternative', 'compare'],
  'News & Trends': ['geo', 'trend', '2026', 'future', 'prediction', 'overview', 'update']
};

const categoryImages = {
  'AI Writing': 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&q=80',
  'AI Design': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80',
  'AI Video': 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&q=80',
  'AI Code': 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80',
  'AI Marketing': 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=600&q=80',
  'AI Automation': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80',
  'AI Business': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
  'Industries': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80',
  'Comparisons': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
  'News & Trends': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80',
  'AI Tools': 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&q=80'
};

// Extract article data
const articles = [];
files.forEach(f => {
  try {
    const html = fs.readFileSync(path.join(articlesDir, f), 'utf-8');
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    const descMatch = html.match(/<meta name="description" content="(.*?)"/);
    const dateMatch = html.match(/article:published_time.*?content="(\d{4}-\d{2}-\d{2})/);
    const imgMatch = html.match(/og:image.*?content="(.*?)"/);
    
    const name = f.toLowerCase();
    let category = 'AI Tools';
    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(k => name.includes(k))) {
        category = cat;
        break;
      }
    }
    
    articles.push({
      file: f,
      slug: f.replace('.html', ''),
      title: titleMatch ? titleMatch[1].replace(/ — AI Tools Hub| \| AI Tools Hub/g, '').trim() : f.replace('.html', '').replace(/-/g, ' '),
      desc: descMatch ? descMatch[1].substring(0, 120) + '...' : '',
      date: dateMatch ? dateMatch[1] : '2026-03-01',
      img: imgMatch ? imgMatch[1] : categoryImages[category] || categoryImages['AI Tools'],
      category
    });
  } catch(e) {}
});

// Sort by date descending
articles.sort((a, b) => b.date.localeCompare(a.date));

// Build articles JSON for client-side filtering
const articlesJSON = JSON.stringify(articles.map(a => ({
  s: a.slug,
  t: a.title,
  d: a.desc,
  dt: a.date,
  i: a.img,
  c: a.category
})));

// Count per category
const catCounts = {};
articles.forEach(a => {
  catCounts[a.category] = (catCounts[a.category] || 0) + 1;
});

const homepage = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    
    <title>AI Tools Hub — Honest AI Tool Reviews for Small Business</title>
    <meta name="description" content="Real reviews of AI tools for small business owners. 370+ in-depth articles on ChatGPT, Claude, Zapier, Midjourney and more — tested, honest, actionable.">
    <meta name="author" content="Sarah Mitchell">
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
    <link rel="canonical" href="https://aitoolshub-psi.vercel.app/">
    
    <meta property="og:type" content="website">
    <meta property="og:title" content="AI Tools Hub — 370+ Honest AI Tool Reviews">
    <meta property="og:description" content="Real reviews of AI tools for small business. Tested for months, honest results.">
    <meta property="og:url" content="https://aitoolshub-psi.vercel.app/">
    <meta property="og:image" content="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80">
    <meta property="og:site_name" content="AI Tools Hub">
    
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="AI Tools Hub — 370+ Honest AI Tool Reviews">
    <meta name="twitter:description" content="Real reviews of AI tools for small business. Tested for months, honest results.">
    <meta name="twitter:image" content="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80">
    
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="style.css">
    
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "name": "AI Tools Hub",
          "url": "https://aitoolshub-psi.vercel.app/",
          "description": "Honest AI tool reviews for small business owners",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://aitoolshub-psi.vercel.app/?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        },
        {
          "@type": "Organization",
          "name": "AI Tools Hub",
          "url": "https://aitoolshub-psi.vercel.app/",
          "logo": "https://aitoolshub-psi.vercel.app/favicon.svg"
        },
        {
          "@type": "ItemList",
          "name": "AI Tool Reviews",
          "numberOfItems": ${articles.length},
          "itemListElement": [
            ${articles.slice(0, 10).map((a, i) => `{
              "@type": "ListItem",
              "position": ${i + 1},
              "url": "https://aitoolshub-psi.vercel.app/articles/${a.slug}"
            }`).join(',\n            ')}
          ]
        }
      ]
    }
    </script>
</head>
<body>
    <header class="site-header">
        <div class="header-inner container">
            <a href="/" class="site-logo">AI Tools Hub</a>
            <nav class="main-nav">
                <a href="/">Home</a>
                <a href="/about">About</a>
                <a href="/resources">Resources</a>
                <a href="/disclosure">Disclosure</a>
                <a href="/contact">Contact</a>
            </nav>
        </div>
    </header>

    <section class="hero" style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:60px 0;color:#fff;text-align:center;">
        <div class="container">
            <h1 style="font-size:42px;margin:0 0 12px;">AI Tools Hub</h1>
            <p style="font-size:20px;opacity:.9;margin:0 0 24px;">370+ honest reviews. Tested by real business owners. No hype.</p>
            <input type="text" id="searchBox" class="search-box" placeholder="🔍 Search tools, topics, comparisons..." style="max-width:500px;border:none;box-shadow:0 4px 20px rgba(0,0,0,.15);">
        </div>
    </section>

    <main class="container" style="margin-top:32px;">
        
        <!-- Category Filters -->
        <div class="category-filters" id="catFilters">
            <button class="cat-btn active" data-cat="all">All (${articles.length})</button>
            ${Object.entries(catCounts).sort((a,b) => b[1] - a[1]).map(([cat, count]) => 
              `<button class="cat-btn" data-cat="${cat}">${cat} (${count})</button>`
            ).join('\n            ')}
        </div>

        <!-- Article Count -->
        <p id="resultCount" style="color:#666;font-size:14px;margin:12px 0;">Showing ${articles.length} articles</p>

        <!-- Article Grid -->
        <div class="article-grid" id="articleGrid"></div>

        <!-- Load More -->
        <button class="load-more-btn" id="loadMore">Load More Articles</button>

    </main>

    <footer class="site-footer" style="margin-top:60px;padding:32px 0;background:#f8f9fa;text-align:center;">
        <div class="container">
            <p style="margin:0 0 8px;font-weight:600;">AI Tools Hub</p>
            <p style="margin:0;font-size:13px;color:#666;">© 2026 AI Tools Hub. Honest reviews for smart business owners.</p>
            <p style="margin:8px 0 0;font-size:13px;">
                <a href="/about">About</a> · <a href="/privacy">Privacy</a> · <a href="/disclosure">Disclosure</a> · <a href="/disclaimer">Terms</a> · <a href="/contact">Contact</a>
            </p>
        </div>
    </footer>

    <script>
    (function(){
        var articles = ${articlesJSON};
        var grid = document.getElementById('articleGrid');
        var searchBox = document.getElementById('searchBox');
        var loadMoreBtn = document.getElementById('loadMore');
        var resultCount = document.getElementById('resultCount');
        var catBtns = document.querySelectorAll('.cat-btn');
        
        var currentCat = 'all';
        var currentSearch = '';
        var perPage = 24;
        var showing = 0;

        function escHtml(s) {
            return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
        }

        function getFiltered() {
            return articles.filter(function(a) {
                var matchCat = currentCat === 'all' || a.c === currentCat;
                var matchSearch = !currentSearch || 
                    a.t.toLowerCase().indexOf(currentSearch) !== -1 || 
                    a.d.toLowerCase().indexOf(currentSearch) !== -1 ||
                    a.c.toLowerCase().indexOf(currentSearch) !== -1;
                return matchCat && matchSearch;
            });
        }

        function renderCards(filtered, start, count) {
            var end = Math.min(start + count, filtered.length);
            var html = '';
            for (var i = start; i < end; i++) {
                var a = filtered[i];
                html += '<div class="article-card">';
                html += '<a href="/articles/' + escHtml(a.s) + '"><img class="article-card-img" src="' + escHtml(a.i) + '" alt="' + escHtml(a.t) + '" loading="lazy"></a>';
                html += '<div class="article-card-body">';
                html += '<span class="article-card-tag">' + escHtml(a.c) + '</span>';
                html += '<h3 class="article-card-title"><a href="/articles/' + escHtml(a.s) + '">' + escHtml(a.t) + '</a></h3>';
                html += '<p class="article-card-excerpt">' + escHtml(a.d) + '</p>';
                html += '<span class="article-card-meta">' + a.dt + '</span>';
                html += '</div></div>';
            }
            return { html: html, shown: end };
        }

        function refresh() {
            var filtered = getFiltered();
            var result = renderCards(filtered, 0, perPage);
            grid.innerHTML = result.html;
            showing = result.shown;
            resultCount.textContent = 'Showing ' + showing + ' of ' + filtered.length + ' articles';
            loadMoreBtn.style.display = showing < filtered.length ? 'block' : 'none';
        }

        function loadMore() {
            var filtered = getFiltered();
            var result = renderCards(filtered, showing, perPage);
            grid.innerHTML += result.html;
            showing = result.shown;
            resultCount.textContent = 'Showing ' + showing + ' of ' + filtered.length + ' articles';
            loadMoreBtn.style.display = showing < filtered.length ? 'block' : 'none';
        }

        // Category filter clicks
        catBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                catBtns.forEach(function(b) { b.classList.remove('active'); });
                btn.classList.add('active');
                currentCat = btn.dataset.cat;
                refresh();
            });
        });

        // Search
        var searchTimer;
        searchBox.addEventListener('input', function() {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(function() {
                currentSearch = searchBox.value.trim().toLowerCase();
                refresh();
            }, 200);
        });

        // Load more
        loadMoreBtn.addEventListener('click', loadMore);

        // Initial render
        refresh();
    })();
    </script>
</body>
</html>`;

fs.writeFileSync('./index.html', homepage);
console.log('Homepage built with ' + articles.length + ' articles across ' + Object.keys(catCounts).length + ' categories');
console.log('Categories:', JSON.stringify(catCounts, null, 2));
