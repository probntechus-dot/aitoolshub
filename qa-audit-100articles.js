#!/usr/bin/env node

/**
 * QA AUDIT FOR 100 ARTICLES
 * Comprehensive quality check for AI Tools Hub
 * Following Faizan's strict standards
 */

const fs = require('fs');
const path = require('path');

const ARTICLES_DIR = path.join(__dirname, 'articles');
const TOP_100_FILE = path.join(__dirname, 'TOP_100_ARTICLES.md');

// Parse TOP_100_ARTICLES.md to get the priority list
function parseTop100Articles() {
  const content = fs.readFileSync(TOP_100_FILE, 'utf-8');
  const articles = [];
  const lines = content.split('\n');
  
  for (let line of lines) {
    // Match numbered list items
    const match = line.match(/^\d+\.\s+(?:✅\s+)?([a-z0-9-]+)/);
    if (match) {
      articles.push(match[1]);
    }
  }
  
  return articles;
}

// Check if article exists
function articleExists(slug) {
  return fs.existsSync(path.join(ARTICLES_DIR, `${slug}.html`));
}

// Get article content
function getArticleContent(slug) {
  const filepath = path.join(ARTICLES_DIR, `${slug}.html`);
  if (!fs.existsSync(filepath)) return null;
  return fs.readFileSync(filepath, 'utf-8');
}

// Count words in HTML (strip tags)
function countWords(html) {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.split(' ').filter(w => w.length > 0).length;
}

// Count images
function countImages(html) {
  const matches = html.match(/<img[^>]*src=/gi);
  return matches ? matches.length : 0;
}

// Check for comparison boxes
function countComparisonBoxes(html) {
  // Look for comparison-box, comparison-grid, or similar classes
  const matches = html.match(/class="[^"]*comparison[^"]*"/gi);
  return matches ? matches.length : 0;
}

// Count FAQs
function countFAQs(html) {
  // Look for FAQ section with itemscope
  const faqMatches = html.match(/itemprop="mainEntity"/gi);
  return faqMatches ? faqMatches.length : 0;
}

// Check for meta description
function hasMetaDescription(html) {
  return /<meta\s+name="description"\s+content="[^"]+"/i.test(html);
}

// Check for Schema markup
function hasSchemaMarkup(html) {
  return /itemtype=".*schema.org/i.test(html);
}

// Check for placeholder text
function hasPlaceholderText(html) {
  const placeholders = [
    '[COMPANY]', '[FEATURE]', '[TOOL]', '[DATE]',
    'Lorem ipsum', 'lorem ipsum',
    'placeholder', 'TODO', 'TBD'
  ];
  
  for (let p of placeholders) {
    if (html.includes(p)) return p;
  }
  return null;
}

// Check for generic filler
function hasGenericFiller(html) {
  const fillers = [
    'AI is changing the world',
    'In today\'s digital age',
    'rapidly evolving',
    'game-changer',
    'revolutionizing'
  ];
  
  const text = html.replace(/<[^>]*>/g, ' ').toLowerCase();
  
  for (let f of fillers) {
    if (text.includes(f.toLowerCase())) return f;
  }
  return null;
}

// Check for internal links
function countInternalLinks(html) {
  const matches = html.match(/href="(?!http)[^"]+\.html"/gi);
  return matches ? matches.length : 0;
}

// Check for modified date
function getModifiedDate(html) {
  const match = html.match(/dateModified["']?\s*:\s*["']([^"']+)/);
  return match ? match[1] : null;
}

// Main audit function
function auditArticle(slug) {
  const html = getArticleContent(slug);
  
  if (!html) {
    return {
      slug,
      exists: false,
      issues: ['Article file not found']
    };
  }
  
  const wordCount = countWords(html);
  const imageCount = countImages(html);
  const comparisonBoxes = countComparisonBoxes(html);
  const faqCount = countFAQs(html);
  const internalLinks = countInternalLinks(html);
  const modifiedDate = getModifiedDate(html);
  const placeholder = hasPlaceholderText(html);
  const filler = hasGenericFiller(html);
  
  const issues = [];
  const warnings = [];
  
  // Critical issues
  if (wordCount < 1000) issues.push(`Word count too low: ${wordCount} (min 1000)`);
  if (imageCount < 4) issues.push(`Not enough images: ${imageCount} (min 4)`);
  if (!hasMetaDescription(html)) issues.push('Missing meta description');
  if (!hasSchemaMarkup(html)) issues.push('Missing Schema markup');
  if (placeholder) issues.push(`Placeholder text found: ${placeholder}`);
  
  // Warnings
  if (wordCount < 2500) warnings.push(`Word count below ideal: ${wordCount} (target 2500-3500)`);
  if (imageCount < 6) warnings.push(`Could use more images: ${imageCount} (ideal 6+)`);
  if (comparisonBoxes === 0) warnings.push('No comparison boxes found');
  if (faqCount < 5) warnings.push(`Few FAQs: ${faqCount} (target 5-10)`);
  if (internalLinks < 3) warnings.push(`Low internal links: ${internalLinks} (target 3-5)`);
  if (modifiedDate !== '2026-03-20') warnings.push(`Modified date not current: ${modifiedDate}`);
  if (filler) warnings.push(`Generic filler detected: ${filler}`);
  
  return {
    slug,
    exists: true,
    wordCount,
    imageCount,
    comparisonBoxes,
    faqCount,
    internalLinks,
    modifiedDate,
    hasMetaDescription: hasMetaDescription(html),
    hasSchema: hasSchemaMarkup(html),
    issues,
    warnings,
    status: issues.length === 0 ? (warnings.length === 0 ? 'EXCELLENT' : 'GOOD') : 'NEEDS_FIXES'
  };
}

// Generate report
function generateReport() {
  console.log('\n=== AI TOOLS HUB - 100 ARTICLES QA AUDIT ===\n');
  console.log('Date:', new Date().toISOString());
  console.log('Standard: Faizan\'s Strict Requirements\n');
  
  const top100 = parseTop100Articles();
  console.log(`Found ${top100.length} articles in TOP_100_ARTICLES.md\n`);
  
  const results = top100.map(slug => auditArticle(slug));
  
  // Summary stats
  const existing = results.filter(r => r.exists);
  const missing = results.filter(r => !r.exists);
  const excellent = results.filter(r => r.status === 'EXCELLENT');
  const good = results.filter(r => r.status === 'GOOD');
  const needsFixes = results.filter(r => r.status === 'NEEDS_FIXES');
  
  console.log('=== SUMMARY ===\n');
  console.log(`Total Articles:       ${top100.length}`);
  console.log(`✅ Existing:          ${existing.length}`);
  console.log(`❌ Missing:           ${missing.length}`);
  console.log(`🌟 Excellent:         ${excellent.length}`);
  console.log(`✔️  Good:             ${good.length}`);
  console.log(`⚠️  Needs Fixes:      ${needsFixes.length}\n`);
  
  // Missing articles
  if (missing.length > 0) {
    console.log('=== MISSING ARTICLES ===\n');
    missing.forEach((r, i) => {
      console.log(`${i+1}. ${r.slug}`);
    });
    console.log('');
  }
  
  // Articles with critical issues
  if (needsFixes.length > 0) {
    console.log('=== ARTICLES WITH CRITICAL ISSUES ===\n');
    needsFixes.forEach((r, i) => {
      console.log(`${i+1}. ${r.slug}`);
      console.log(`   Word Count: ${r.wordCount || 'N/A'}`);
      console.log(`   Images: ${r.imageCount || 0}`);
      r.issues.forEach(issue => console.log(`   ❌ ${issue}`));
      console.log('');
    });
  }
  
  // Detailed stats
  console.log('=== QUALITY METRICS (Existing Articles) ===\n');
  
  const avgWordCount = existing.length > 0 
    ? Math.round(existing.reduce((sum, r) => sum + r.wordCount, 0) / existing.length)
    : 0;
  const avgImages = existing.length > 0
    ? (existing.reduce((sum, r) => sum + r.imageCount, 0) / existing.length).toFixed(1)
    : 0;
  const avgFAQs = existing.length > 0
    ? (existing.reduce((sum, r) => sum + r.faqCount, 0) / existing.length).toFixed(1)
    : 0;
  
  console.log(`Average Word Count:   ${avgWordCount} (target: 2500-3500)`);
  console.log(`Average Images:       ${avgImages} (target: 4-6)`);
  console.log(`Average FAQs:         ${avgFAQs} (target: 5-10)`);
  console.log(`Articles with Meta:   ${existing.filter(r => r.hasMetaDescription).length}/${existing.length}`);
  console.log(`Articles with Schema: ${existing.filter(r => r.hasSchema).length}/${existing.length}`);
  console.log('');
  
  // Top performers
  const topPerformers = existing
    .filter(r => r.status === 'EXCELLENT')
    .sort((a, b) => b.wordCount - a.wordCount)
    .slice(0, 5);
  
  if (topPerformers.length > 0) {
    console.log('=== TOP 5 PERFORMERS ===\n');
    topPerformers.forEach((r, i) => {
      console.log(`${i+1}. ${r.slug}`);
      console.log(`   Words: ${r.wordCount} | Images: ${r.imageCount} | FAQs: ${r.faqCount} | Comparisons: ${r.comparisonBoxes}`);
    });
    console.log('');
  }
  
  // Final recommendation
  console.log('=== FINAL RECOMMENDATION ===\n');
  
  if (missing.length > 0) {
    console.log('❌ NEEDS FIXES - Missing articles must be created\n');
    console.log(`Action Required: Create ${missing.length} missing articles\n`);
  } else if (needsFixes.length > 20) {
    console.log('❌ NEEDS FIXES - Too many articles with critical issues\n');
    console.log(`Action Required: Fix ${needsFixes.length} articles before scaling to 500\n`);
  } else if (needsFixes.length > 0) {
    console.log('⚠️  CONDITIONAL APPROVAL - Minor fixes needed\n');
    console.log(`Action Required: Fix ${needsFixes.length} articles, then proceed\n`);
  } else if (good.length > excellent.length * 2) {
    console.log('✅ APPROVED WITH CAUTION - Good but could be excellent\n');
    console.log('Recommendation: Consider enhancing articles to EXCELLENT before scaling\n');
  } else {
    console.log('✅ APPROVED FOR SCALE TO 500 ARTICLES\n');
    console.log('All 100 articles meet or exceed quality standards.\n');
  }
  
  // Save detailed JSON report
  const jsonReport = {
    timestamp: new Date().toISOString(),
    summary: {
      total: top100.length,
      existing: existing.length,
      missing: missing.length,
      excellent: excellent.length,
      good: good.length,
      needsFixes: needsFixes.length
    },
    metrics: {
      avgWordCount,
      avgImages: parseFloat(avgImages),
      avgFAQs: parseFloat(avgFAQs)
    },
    articles: results
  };
  
  fs.writeFileSync(
    path.join(__dirname, 'QA_AUDIT_REPORT.json'),
    JSON.stringify(jsonReport, null, 2)
  );
  
  console.log('📄 Detailed report saved to: QA_AUDIT_REPORT.json\n');
}

// Run the audit
generateReport();
