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

  // === STATE ===
  var allArticles = typeof ARTICLES_DATA !== 'undefined' ? ARTICLES_DATA : [];
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
        '<img src="' + escapeHtml(a.i) + '&w=120&q=70" alt="" class="recent-post-thumb" loading="lazy">' +
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
    return '<div class="post-card card-animate" style="animation-delay:' + delay + 'ms">' +
      '<div class="post-card-img-wrap">' +
        '<img src="' + escapeHtml(a.i.replace(/w=\d+/, 'w=600')) + '" alt="' + escapeHtml(a.t) + '" class="post-card-img" loading="lazy">' +
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
  buildCategoryPills();
  buildSidebarRecent();
  applyFilters();

  // Update search placeholder with accurate count
  searchInput.placeholder = 'Search ' + allArticles.length + ' articles — type a topic, tool, or keyword...';

})();
