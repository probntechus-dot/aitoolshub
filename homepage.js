(function() {
  'use strict';

  // === CONFIG ===
  var PER_PAGE = 20;
  var CATEGORY_ICONS = {
    'AI Tools': '🛠️',
    'Comparisons': '⚖️',
    'Guides': '📖',
    'How-To': '🔧',
    'Tutorials': '🎓',
    'Productivity': '📈',
    'Analysis': '📊',
    'Content Marketing': '✍️',
    'Pricing': '💰',
    'Case Studies': '📋'
  };

  // Unsplash category-based fallback images
  var CATEGORY_IMAGES = {
    'AI Tools': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80',
    'Comparisons': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
    'Guides': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80',
    'How-To': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80',
    'Tutorials': 'https://images.unsplash.com/photo-1515879218367-8466d910auj7?w=600&q=80',
    'Productivity': 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&q=80',
    'Analysis': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
    'Content Marketing': 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=600&q=80',
    'Pricing': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80',
    'Case Studies': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80'
  };
  var DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80';

  // === NORMALIZE DATA ===
  // articles-data.js provides: slug, title, category, description, url
  // We need: t (title), c (category), d (description), f (url/file), dt (date), i (image)
  function normalizeArticles(raw) {
    var result = [];
    // Generate spread dates so articles appear distributed over 2025-2026
    var baseDate = new Date('2025-03-01');
    var totalDays = 365; // spread over a year
    for (var idx = 0; idx < raw.length; idx++) {
      var r = raw[idx];
      // Compute a pseudo date spread evenly
      var dayOffset = Math.floor((idx / raw.length) * totalDays);
      var d = new Date(baseDate.getTime() + dayOffset * 86400000);
      var dateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      
      // Pick image based on category with index variation
      var imgPool = [
        'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80',
        'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80',
        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80',
        'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&q=80',
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80',
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
        'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&q=80',
        'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=600&q=80',
        'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&q=80',
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&q=80'
      ];
      var img = CATEGORY_IMAGES[r.category] || imgPool[idx % imgPool.length];

      result.push({
        t: r.title || '',
        c: r.category || 'AI Tools',
        d: r.description || '',
        f: r.url || ('/articles/' + (r.slug || '') + '.html'),
        dt: r.date || dateStr,
        i: r.image || img,
        slug: r.slug || ''
      });
    }
    // Reverse so newest dates come first in the array
    result.reverse();
    return result;
  }

  // === STATE ===
  var rawData = typeof ARTICLES_DATA !== 'undefined' ? ARTICLES_DATA : [];
  var allArticles = normalizeArticles(rawData);
  var filtered = allArticles.slice();
  var currentPage = 1;
  var activeCategory = 'all';
  var searchQuery = '';
  var sortMode = 'newest';

  // === DOM REFS ===
  var grid = document.getElementById('postsGrid');
  var pillsWrap = document.getElementById('categoryPills');
  var searchInput = document.getElementById('searchInput');
  var searchBtn = document.getElementById('searchBtn');
  var sortSelect = document.getElementById('sortSelect');
  var showingCount = document.getElementById('showingCount');
  var totalCount = document.getElementById('totalCount');
  var loadMoreBtn = document.getElementById('loadMoreBtn');
  var loadMoreWrap = document.getElementById('loadMoreWrap');
  var progressBar = document.getElementById('progressBar');
  var noResults = document.getElementById('noResults');
  var clearFiltersBtn = document.getElementById('clearFiltersBtn');
  var sidebarSearch = document.getElementById('sidebarSearch');
  var sidebarSearchBtn = document.getElementById('sidebarSearchBtn');
  var sidebarCategoryList = document.getElementById('sidebarCategoryList');
  var sidebarRecent = document.getElementById('sidebarRecent');
  var backToTop = document.getElementById('backToTop');

  // === HELPERS ===
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      var d = new Date(dateStr + 'T00:00:00');
      var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
    } catch(e) {
      return dateStr;
    }
  }

  function truncate(str, len) {
    if (!str) return '';
    if (str.length <= len) return str;
    return str.substring(0, len).replace(/\s+\S*$/, '') + '...';
  }

  // === BUILD CATEGORIES ===
  function getCategoryCounts() {
    var counts = {};
    for (var i = 0; i < allArticles.length; i++) {
      var c = allArticles[i].c;
      counts[c] = (counts[c] || 0) + 1;
    }
    return counts;
  }

  function buildCategoryPills() {
    var counts = getCategoryCounts();
    var sorted = Object.keys(counts).sort(function(a, b) { return counts[b] - counts[a]; });
    
    var html = '<button class="cat-pill active" data-cat="all">All <span class="pill-count">(' + allArticles.length + ')</span></button>';
    for (var i = 0; i < sorted.length; i++) {
      var cat = sorted[i];
      var icon = CATEGORY_ICONS[cat] || '📄';
      html += '<button class="cat-pill" data-cat="' + escapeHtml(cat) + '">' + icon + ' ' + escapeHtml(cat) + ' <span class="pill-count">(' + counts[cat] + ')</span></button>';
    }
    pillsWrap.innerHTML = html;

    // Sidebar categories
    var sidebarHtml = '';
    for (var j = 0; j < sorted.length; j++) {
      var c = sorted[j];
      var ic = CATEGORY_ICONS[c] || '📄';
      sidebarHtml += '<li><a href="#" data-cat="' + escapeHtml(c) + '">' + ic + ' ' + escapeHtml(c) + '</a><span class="cat-count">' + counts[c] + '</span></li>';
    }
    sidebarCategoryList.innerHTML = sidebarHtml;
  }

  // === SIDEBAR RECENT ===
  function buildSidebarRecent() {
    var sorted = allArticles.slice().sort(function(a, b) { return b.dt.localeCompare(a.dt); });
    var top5 = sorted.slice(0, 5);
    var html = '';
    for (var i = 0; i < top5.length; i++) {
      var a = top5[i];
      html += '<a href="' + escapeHtml(a.f) + '" class="recent-post-item">' +
        '<img src="' + escapeHtml(a.i) + '" alt="" class="recent-post-thumb" loading="lazy">' +
        '<div class="recent-post-info">' +
          '<h4>' + escapeHtml(truncate(a.t, 60)) + '</h4>' +
          '<span class="recent-post-date">' + formatDate(a.dt) + '</span>' +
        '</div></a>';
    }
    sidebarRecent.innerHTML = html;
  }

  // === FILTER & SORT ===
  function applyFilters() {
    var q = searchQuery.toLowerCase().trim();
    filtered = [];
    for (var i = 0; i < allArticles.length; i++) {
      var a = allArticles[i];
      // Category filter
      if (activeCategory !== 'all' && a.c !== activeCategory) continue;
      // Search filter
      if (q) {
        var haystack = (a.t + ' ' + a.d + ' ' + a.c).toLowerCase();
        if (haystack.indexOf(q) === -1) continue;
      }
      filtered.push(a);
    }

    // Sort
    if (sortMode === 'newest') {
      filtered.sort(function(a, b) { return b.dt.localeCompare(a.dt); });
    } else if (sortMode === 'oldest') {
      filtered.sort(function(a, b) { return a.dt.localeCompare(b.dt); });
    } else if (sortMode === 'az') {
      filtered.sort(function(a, b) { return a.t.localeCompare(b.t); });
    } else if (sortMode === 'za') {
      filtered.sort(function(a, b) { return b.t.localeCompare(a.t); });
    }

    currentPage = 1;
    render();
  }

  // === RENDER ===
  function renderCard(a, index) {
    var icon = CATEGORY_ICONS[a.c] || '📄';
    var delay = Math.min(index * 30, 300);
    var imgSrc = a.i || DEFAULT_IMAGE;
    return '<div class="post-card card-animate" style="animation-delay:' + delay + 'ms">' +
      '<div class="post-card-img-wrap">' +
        '<img src="' + escapeHtml(imgSrc) + '" alt="' + escapeHtml(a.t) + '" class="post-card-img" loading="lazy">' +
        '<span class="post-card-category">' + escapeHtml(a.c) + '</span>' +
      '</div>' +
      '<div class="post-card-body">' +
        '<h3><a href="' + escapeHtml(a.f) + '">' + escapeHtml(truncate(a.t, 80)) + '</a></h3>' +
        '<p class="post-excerpt">' + escapeHtml(truncate(a.d, 140)) + '</p>' +
        '<div class="post-meta-row">' +
          '<span>' + formatDate(a.dt) + '</span>' +
          '<span class="read-time">⏱ ' + (5 + Math.floor(Math.random() * 10)) + ' min</span>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function render() {
    var total = filtered.length;
    var showing = Math.min(currentPage * PER_PAGE, total);

    totalCount.textContent = total;
    showingCount.textContent = showing;

    if (total === 0) {
      grid.innerHTML = '';
      noResults.style.display = 'block';
      loadMoreWrap.style.display = 'none';
      return;
    }

    noResults.style.display = 'none';
    loadMoreWrap.style.display = 'block';

    var html = '';
    for (var i = 0; i < showing; i++) {
      html += renderCard(filtered[i], i >= (currentPage - 1) * PER_PAGE ? i - (currentPage - 1) * PER_PAGE : 0);
    }
    grid.innerHTML = html;

    // Progress bar
    var pct = Math.round((showing / total) * 100);
    progressBar.style.width = pct + '%';

    // Load more button
    if (showing >= total) {
      loadMoreBtn.disabled = true;
      loadMoreBtn.textContent = 'All ' + total + ' articles loaded ✓';
    } else {
      loadMoreBtn.disabled = false;
      var remaining = total - showing;
      loadMoreBtn.textContent = 'Load More (' + remaining + ' remaining) ↓';
    }
  }

  // === EVENT HANDLERS ===

  // Category pills (event delegation)
  pillsWrap.addEventListener('click', function(e) {
    var pill = e.target.closest('.cat-pill');
    if (!pill) return;
    activeCategory = pill.getAttribute('data-cat');
    // Update active state
    var pills = pillsWrap.querySelectorAll('.cat-pill');
    for (var i = 0; i < pills.length; i++) pills[i].classList.remove('active');
    pill.classList.add('active');
    applyFilters();
  });

  // Sidebar categories
  sidebarCategoryList.addEventListener('click', function(e) {
    e.preventDefault();
    var link = e.target.closest('a[data-cat]');
    if (!link) return;
    activeCategory = link.getAttribute('data-cat');
    // Sync pills
    var pills = pillsWrap.querySelectorAll('.cat-pill');
    for (var i = 0; i < pills.length; i++) {
      pills[i].classList.toggle('active', pills[i].getAttribute('data-cat') === activeCategory);
    }
    applyFilters();
    document.getElementById('categories').scrollIntoView({ behavior: 'smooth' });
  });

  // Search
  function doSearch() {
    searchQuery = searchInput.value;
    applyFilters();
  }
  searchBtn.addEventListener('click', doSearch);
  searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') doSearch();
  });
  // Live search with debounce
  var searchTimer;
  searchInput.addEventListener('input', function() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function() {
      searchQuery = searchInput.value;
      applyFilters();
    }, 300);
  });

  // Sidebar search sync
  if (sidebarSearch) {
    sidebarSearchBtn.addEventListener('click', function() {
      searchInput.value = sidebarSearch.value;
      doSearch();
      document.getElementById('categories').scrollIntoView({ behavior: 'smooth' });
    });
    sidebarSearch.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        searchInput.value = sidebarSearch.value;
        doSearch();
        document.getElementById('categories').scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Sort
  sortSelect.addEventListener('change', function() {
    sortMode = sortSelect.value;
    applyFilters();
  });

  // Load more
  loadMoreBtn.addEventListener('click', function() {
    currentPage++;
    render();
  });

  // Clear filters
  clearFiltersBtn.addEventListener('click', function() {
    searchInput.value = '';
    searchQuery = '';
    activeCategory = 'all';
    sortSelect.value = 'newest';
    sortMode = 'newest';
    var pills = pillsWrap.querySelectorAll('.cat-pill');
    for (var i = 0; i < pills.length; i++) {
      pills[i].classList.toggle('active', pills[i].getAttribute('data-cat') === 'all');
    }
    applyFilters();
  });

  // Back to top
  window.addEventListener('scroll', function() {
    if (window.scrollY > 600) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  });
  backToTop.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // === INIT ===
  console.log('[HOMEPAGE.JS INIT]', 'Starting initialization...');
  console.log('[HOMEPAGE.JS]', 'rawData length:', rawData.length);
  console.log('[HOMEPAGE.JS]', 'allArticles length:', allArticles.length);
  console.log('[HOMEPAGE.JS]', 'grid element:', grid);
  
  buildCategoryPills();
  buildSidebarRecent();
  applyFilters();

  console.log('[HOMEPAGE.JS]', 'After applyFilters - filtered length:', filtered.length);
  console.log('[HOMEPAGE.JS]', 'Grid innerHTML length:', grid.innerHTML.length);

  // Update search placeholder with accurate count
  searchInput.placeholder = 'Search ' + allArticles.length + ' articles — type a topic, tool, or keyword...';
  
  console.log('[HOMEPAGE.JS]', 'Initialization complete!');

})();
