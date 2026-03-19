(function() {
  'use strict';
  
  var PER_PAGE = 20;
  var allArticles = [];
  var filtered = [];
  var currentPage = 1;
  var activeCategory = 'all';
  var searchQuery = '';
  var sortMode = 'newest';
  
  // DOM refs
  var grid = document.getElementById('postsGrid');
  var showingCount = document.getElementById('showingCount');
  var totalCount = document.getElementById('totalCount');
  var loadMoreBtn = document.getElementById('loadMoreBtn');
  var loadMoreWrap = document.getElementById('loadMoreWrap');
  var noResults = document.getElementById('noResults');
  var progressBar = document.getElementById('progressBar');
  var sortSelect = document.getElementById('sortSelect');
  var pillsWrap = document.getElementById('categoryPills');
  var clearFiltersBtn = document.getElementById('clearFiltersBtn');
  var searchInput = document.getElementById('searchInput');
  var searchBtn = document.getElementById('searchBtn');
  var sidebarSearch = document.getElementById('sidebarSearch');
  var sidebarSearchBtn = document.getElementById('sidebarSearchBtn');
  var sidebarCategoryList = document.getElementById('sidebarCategoryList');
  var sidebarRecent = document.getElementById('sidebarRecent');
  var backToTop = document.getElementById('backToTop');
  
  // Initialize articles from ARTICLES_DATA
  function initArticles() {
    console.log('[INIT]', 'typeof ARTICLES_DATA:', typeof ARTICLES_DATA);
    
    if (typeof ARTICLES_DATA === 'undefined' || !ARTICLES_DATA || ARTICLES_DATA.length === 0) {
      console.error('[INIT ERROR]', 'ARTICLES_DATA not loaded!');
      return;
    }
    
    console.log('[INIT]', 'ARTICLES_DATA length:', ARTICLES_DATA.length);
    
    // Simple transformation - just add needed fields
    allArticles = ARTICLES_DATA.map(function(a, idx) {
      return {
        title: a.title || '',
        category: a.category || 'AI Tools',
        description: a.description || '',
        url: a.url || '#',
        date: a.date || '2026-03-01',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80',
        slug: a.slug || ''
      };
    });
    
    console.log('[INIT]', 'Transformed articles length:', allArticles.length);
    filtered = allArticles.slice();
    renderAll();
  }
  
  function renderCard(a, idx) {
    return '<div class="post-card card-animate" style="animation-delay:' + (Math.min(idx * 30, 300)) + 'ms">' +
      '<div class="post-card-img-wrap">' +
        '<img src="' + a.image + '" alt="' + a.title + '" class="post-card-img" loading="lazy">' +
        '<span class="post-card-category">' + a.category + '</span>' +
      '</div>' +
      '<div class="post-card-body">' +
        '<h3><a href="' + a.url + '">' + a.title.substring(0, 80) + '</a></h3>' +
        '<p class="post-excerpt">' + a.description.substring(0, 140) + '...</p>' +
        '<div class="post-meta-row">' +
          '<span>' + a.date + '</span>' +
          '<span class="read-time">⏱ 5 min</span>' +
        '</div>' +
      '</div>' +
    '</div>';
  }
  
  function renderAll() {
    var total = filtered.length;
    var showing = Math.min(currentPage * PER_PAGE, total);
    var startIdx = (currentPage - 1) * PER_PAGE;
    var endIdx = Math.min(startIdx + PER_PAGE, filtered.length);
    
    console.log('[RENDER]', 'total:', total, 'showing:', showing, 'startIdx:', startIdx, 'endIdx:', endIdx);
    
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
    for (var i = startIdx; i < endIdx; i++) {
      if (filtered[i]) {
        html += renderCard(filtered[i], i - startIdx);
      }
    }
    
    console.log('[RENDER]', 'Generated HTML length:', html.length, 'cards:', (endIdx - startIdx));
    grid.innerHTML = html;
    
    // Progress bar
    var pct = Math.round((showing / total) * 100);
    if (progressBar) progressBar.style.width = pct + '%';
    
    // Load more button
    if (loadMoreBtn) {
      if (showing >= total) {
        loadMoreBtn.disabled = true;
        loadMoreBtn.textContent = 'All ' + total + ' articles loaded ✓';
      } else {
        loadMoreBtn.disabled = false;
        var remaining = total - showing;
        loadMoreBtn.textContent = 'Load More (' + remaining + ' remaining) ↓';
      }
    }
  }
  
  // Load More
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', function() {
      currentPage++;
      renderAll();
    });
  }
  
  // Initialize when page loads
  console.log('[HOMEPAGE]', 'Script loaded, checking for ARTICLES_DATA...');
  
  function tryInit() {
    console.log('[HOMEPAGE]', 'tryInit called, ARTICLES_DATA defined?', typeof ARTICLES_DATA !== 'undefined');
    
    if (typeof ARTICLES_DATA !== 'undefined' && ARTICLES_DATA && ARTICLES_DATA.length > 0) {
      console.log('[HOMEPAGE]', 'SUCCESS: ARTICLES_DATA found with', ARTICLES_DATA.length, 'articles!');
      initArticles();
      return true;
    }
    console.log('[HOMEPAGE]', 'ARTICLES_DATA not ready yet');
    return false;
  }
  
  // Try immediately
  if (!tryInit()) {
    // Wait for ARTICLES_DATA to be defined (it should be loaded by articles-data.js)
    var checkCounter = 0;
    var checkInterval = setInterval(function() {
      if (tryInit()) {
        clearInterval(checkInterval);
      } else {
        checkCounter++;
        if (checkCounter > 50) {
          clearInterval(checkInterval);
          console.error('[ERROR]', 'ARTICLES_DATA never loaded after 5 seconds!');
          // Emergency: show error in grid
          if (grid) {
            grid.innerHTML = '<div style="color:red;padding:20px;">Error: Articles data failed to load. Check browser console.</div>';
          }
        }
      }
    }, 100);
  }
  
  // Also add to window.onload as final fallback
  window.addEventListener('load', function() {
    console.log('[HOMEPAGE]', 'Window load event fired');
    tryInit();
  });

})();
