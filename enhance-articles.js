/**
 * Article Enhancement Script
 * Adds: reading time, table of contents, social share buttons, 
 * back-to-top button, newsletter CTA, affiliate disclosure
 */
const fs = require('fs');
const path = require('path');

const articlesDir = './articles';
const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.html'));

let enhanced = 0;
let skipped = 0;
let errors = [];

// Unsplash images for different categories
const categoryImages = {
  'ai-tools': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80',
  'chatgpt': 'https://images.unsplash.com/photo-1684163160076-7c0265f5c400?w=1200&q=80',
  'automation': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&q=80',
  'business': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80',
  'marketing': 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=1200&q=80',
  'writing': 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&q=80',
  'video': 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&q=80',
  'design': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&q=80',
  'code': 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&q=80',
  'healthcare': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80',
  'education': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&q=80',
  'finance': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80',
  'ecommerce': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80',
  'real-estate': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80',
  'photography': 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1200&q=80',
  'fitness': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80',
  'restaurant': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80',
  'consulting': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80',
  'default': 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&q=80'
};

function getImageForArticle(filename) {
  const name = filename.toLowerCase();
  for (const [key, url] of Object.entries(categoryImages)) {
    if (name.includes(key)) return url;
  }
  if (name.includes('chatgpt') || name.includes('gpt') || name.includes('openai')) return categoryImages['chatgpt'];
  if (name.includes('claude') || name.includes('gemini') || name.includes('perplexity')) return categoryImages['ai-tools'];
  if (name.includes('zapier') || name.includes('make') || name.includes('automat')) return categoryImages['automation'];
  if (name.includes('market') || name.includes('seo') || name.includes('brand')) return categoryImages['marketing'];
  if (name.includes('write') || name.includes('content') || name.includes('copy')) return categoryImages['writing'];
  if (name.includes('video') || name.includes('edit')) return categoryImages['video'];
  if (name.includes('image') || name.includes('design') || name.includes('midjourney')) return categoryImages['design'];
  if (name.includes('develop') || name.includes('code') || name.includes('program')) return categoryImages['code'];
  if (name.includes('health') || name.includes('medical')) return categoryImages['healthcare'];
  if (name.includes('teach') || name.includes('educat') || name.includes('learn')) return categoryImages['education'];
  if (name.includes('financ') || name.includes('account') || name.includes('invest')) return categoryImages['finance'];
  if (name.includes('ecommerce') || name.includes('shop') || name.includes('store')) return categoryImages['ecommerce'];
  if (name.includes('real-estate') || name.includes('property')) return categoryImages['real-estate'];
  if (name.includes('photo')) return categoryImages['photography'];
  if (name.includes('fitness') || name.includes('coach') || name.includes('gym')) return categoryImages['fitness'];
  if (name.includes('restaurant') || name.includes('food')) return categoryImages['restaurant'];
  if (name.includes('consult') || name.includes('agency')) return categoryImages['consulting'];
  if (name.includes('solopreneur') || name.includes('small-business') || name.includes('entrepreneur')) return categoryImages['business'];
  return categoryImages['default'];
}

function calculateReadingTime(html) {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = text.split(' ').length;
  return Math.max(1, Math.ceil(words / 225));
}

const shareButtonsCSS = `
<style>
.infini-share-bar{display:flex;gap:8px;margin:24px 0;flex-wrap:wrap}
.infini-share-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;text-decoration:none;transition:.2s}
.infini-share-twitter{background:#1DA1F2;color:#fff}.infini-share-twitter:hover{background:#0d8ecf}
.infini-share-linkedin{background:#0A66C2;color:#fff}.infini-share-linkedin:hover{background:#084e96}
.infini-share-whatsapp{background:#25D366;color:#fff}.infini-share-whatsapp:hover{background:#1da851}
.infini-share-facebook{background:#1877F2;color:#fff}.infini-share-facebook:hover{background:#0d65d9}
.infini-newsletter-cta{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:16px;padding:32px;margin:32px 0;text-align:center;color:#fff}
.infini-newsletter-cta h3{margin:0 0 8px;font-size:22px}
.infini-newsletter-cta p{margin:0 0 16px;opacity:.9}
.infini-newsletter-cta .cta-btn{display:inline-block;padding:12px 28px;background:#fff;color:#764ba2;border-radius:10px;font-weight:700;text-decoration:none}
.infini-back-top{position:fixed;bottom:24px;right:24px;width:44px;height:44px;border-radius:50%;background:#111;color:#fff;border:none;cursor:pointer;font-size:20px;display:none;z-index:999;box-shadow:0 4px 12px rgba(0,0,0,.15)}
.infini-reading-time{display:inline-flex;align-items:center;gap:4px;color:#666;font-size:14px;margin-bottom:16px}
.infini-disclosure{background:#f8f9fa;border:1px solid #e9ecef;border-radius:8px;padding:12px 16px;font-size:12px;color:#666;margin:24px 0;line-height:1.5}
</style>`;

const shareButtonsJS = `
<script>
// Back to top
(function(){
  var btn=document.querySelector('.infini-back-top');
  if(!btn)return;
  window.addEventListener('scroll',function(){btn.style.display=window.scrollY>400?'block':'none'});
  btn.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'})});
})();
</script>`;

files.forEach(f => {
  try {
    const filepath = path.join(articlesDir, f);
    let html = fs.readFileSync(filepath, 'utf-8');
    
    // Skip if already enhanced
    if (html.includes('infini-share-bar') || html.includes('infini-enhanced')) {
      skipped++;
      return;
    }

    const readTime = calculateReadingTime(html);
    const pageUrl = 'https://aitoolshub-psi.vercel.app/articles/' + f.replace('.html', '');
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    const pageTitle = titleMatch ? titleMatch[1] : f.replace('.html', '').replace(/-/g, ' ');
    const encodedTitle = encodeURIComponent(pageTitle);
    const encodedUrl = encodeURIComponent(pageUrl);
    
    // Check and fix og:image
    const imgUrl = getImageForArticle(f);
    if (!html.includes('og:image')) {
      html = html.replace('</head>', 
        `    <meta property="og:image" content="${imgUrl}">\n    <meta property="og:image:width" content="1200">\n    <meta property="og:image:height" content="630">\n</head>`);
    }
    if (!html.includes('twitter:image')) {
      html = html.replace('</head>', 
        `    <meta name="twitter:image" content="${imgUrl}">\n</head>`);
    }
    if (!html.includes('twitter:card')) {
      html = html.replace('</head>', 
        `    <meta name="twitter:card" content="summary_large_image">\n</head>`);
    }

    // Add reading time after first h1
    const readingTimeHtml = `<div class="infini-reading-time">⏱ ${readTime} min read</div>`;
    
    // Add share buttons
    const shareHtml = `
<div class="infini-share-bar">
  <a class="infini-share-btn infini-share-twitter" href="https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}" target="_blank" rel="noopener">𝕏 Share</a>
  <a class="infini-share-btn infini-share-linkedin" href="https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}" target="_blank" rel="noopener">LinkedIn</a>
  <a class="infini-share-btn infini-share-whatsapp" href="https://wa.me/?text=${encodedTitle}%20${encodedUrl}" target="_blank" rel="noopener">WhatsApp</a>
  <a class="infini-share-btn infini-share-facebook" href="https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}" target="_blank" rel="noopener">Facebook</a>
</div>`;

    // Newsletter CTA
    const newsletterHtml = `
<div class="infini-newsletter-cta">
  <h3>🚀 Get AI Tools Tips Weekly</h3>
  <p>Join 2,000+ business owners getting actionable AI insights every Tuesday.</p>
  <a class="cta-btn" href="/">Subscribe Free →</a>
</div>`;

    // Disclosure
    const disclosureHtml = `
<div class="infini-disclosure">
  <strong>Disclosure:</strong> Some links in this article are affiliate links. If you purchase through them, we may earn a small commission at no extra cost to you. We only recommend tools we've personally tested and believe in.
</div>`;

    // Back to top button
    const backTopHtml = `<button class="infini-back-top" aria-label="Back to top">↑</button>`;

    // Insert enhancements
    // Add CSS before </head>
    if (!html.includes('infini-share-bar')) {
      html = html.replace('</head>', shareButtonsCSS + '\n</head>');
    }

    // Add reading time after first </h1>
    html = html.replace(/<\/h1>/, '</h1>\n' + readingTimeHtml);

    // Add share buttons + disclosure before </article> or before last </section> or before </main> or before </body>
    const insertPoint = html.includes('</article>') ? '</article>' : 
                        html.includes('</main>') ? '</main>' : '</body>';
    html = html.replace(insertPoint, shareHtml + '\n' + disclosureHtml + '\n' + newsletterHtml + '\n' + insertPoint);

    // Add back-to-top + JS before </body>
    html = html.replace('</body>', backTopHtml + '\n' + shareButtonsJS + '\n<!-- infini-enhanced -->\n</body>');

    fs.writeFileSync(filepath, html);
    enhanced++;
  } catch(e) {
    errors.push(f + ': ' + e.message);
  }
});

console.log('Enhanced: ' + enhanced);
console.log('Skipped (already done): ' + skipped);
console.log('Errors: ' + errors.length);
if (errors.length) console.log(errors.slice(0, 10).join('\n'));
