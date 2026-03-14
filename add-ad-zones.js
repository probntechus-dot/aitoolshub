/**
 * Add AdSense-ready ad placement zones to all articles
 * Zones: header banner, in-content (after 3rd paragraph), sidebar-ready, footer
 */
const fs = require('fs');
const path = require('path');

const articlesDir = './articles';
const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.html'));

const adCSS = `
<style>
.ad-zone{background:#fafafa;border:1px dashed #ddd;border-radius:8px;padding:16px;margin:24px 0;text-align:center;min-height:90px;display:flex;align-items:center;justify-content:center}
.ad-zone-header{min-height:90px}
.ad-zone-incontent{min-height:250px;margin:32px 0}
.ad-zone-footer{min-height:90px;margin-top:32px}
.ad-zone-label{font-size:11px;color:#bbb;text-transform:uppercase;letter-spacing:1px}
</style>`;

// Ad zone HTML placeholders (will be replaced with actual AdSense code later)
const headerAd = `
<div class="ad-zone ad-zone-header">
  <!-- AdSense Header Banner - 728x90 -->
  <span class="ad-zone-label">Advertisement</span>
</div>`;

const inContentAd = `
<div class="ad-zone ad-zone-incontent">
  <!-- AdSense In-Content - 336x280 or Responsive -->
  <span class="ad-zone-label">Advertisement</span>
</div>`;

const footerAd = `
<div class="ad-zone ad-zone-footer">
  <!-- AdSense Footer Banner - 728x90 -->
  <span class="ad-zone-label">Advertisement</span>
</div>`;

let modified = 0;

files.forEach(f => {
  try {
    const filepath = path.join(articlesDir, f);
    let html = fs.readFileSync(filepath, 'utf-8');
    
    if (html.includes('ad-zone')) return; // Already has ads
    
    // Add ad CSS
    html = html.replace('</head>', adCSS + '\n</head>');
    
    // Add header ad after first <article> or after <main> or after <body>
    const articleStart = html.indexOf('<article');
    if (articleStart !== -1) {
      const afterTag = html.indexOf('>', articleStart) + 1;
      html = html.slice(0, afterTag) + '\n' + headerAd + html.slice(afterTag);
    }
    
    // Add in-content ad after 3rd </p>
    let pCount = 0;
    let insertIdx = -1;
    const pRegex = /<\/p>/g;
    let match;
    while ((match = pRegex.exec(html)) !== null) {
      pCount++;
      if (pCount === 4) {
        insertIdx = match.index + match[0].length;
        break;
      }
    }
    if (insertIdx > -1) {
      html = html.slice(0, insertIdx) + '\n' + inContentAd + html.slice(insertIdx);
    }
    
    // Add footer ad before infini-share-bar or before </article>
    const shareIdx = html.indexOf('infini-share-bar');
    if (shareIdx !== -1) {
      const divStart = html.lastIndexOf('<div', shareIdx);
      html = html.slice(0, divStart) + footerAd + '\n' + html.slice(divStart);
    }
    
    fs.writeFileSync(filepath, html);
    modified++;
  } catch(e) {}
});

console.log('Ad zones added to ' + modified + ' articles');
