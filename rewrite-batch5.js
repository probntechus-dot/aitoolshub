#!/usr/bin/env node
/**
 * Batch 5 Article Rewriter - Marketing & Analytics
 * Applies REWRITE_METHODOLOGY.md to 20 articles
 * 
 * Target: 2,500-3,500 words per article
 * Features: Scenario openings, real numbers, 4 images, comparison boxes, FAQs, E-E-A-T signals
 */

const fs = require('fs').promises;
const path = require('path');

const ARTICLES_DIR = './articles';

// Article mapping for Batch 5
const BATCH_5_ARTICLES = [
  // Group 1: Marketing & Personalization (1-5)
  { id: 61, file: 'best-ai-marketing-automation-tools.html', exists: true },
  { id: 62, file: 'ai-personalization-ecommerce-2026.html', exists: true },
  { id: 63, file: 'ai-influencer-discovery-2026.html', exists: true },
  { id: 64, file: 'ai-conversion-rate-optimization-2026.html', exists: false, create: true },
  { id: 65, file: 'ai-landing-page-builders-2026.html', exists: true },
  
  // Group 2: Testing & Analytics (6-10)
  { id: 66, file: 'ai-ab-testing-optimization-2026.html', exists: true },
  { id: 67, file: 'ai-predictive-maintenance-industrial.html', exists: true, note: 'Repurpose for business analytics' },
  { id: 68, file: 'ai-infographic-data-visualization-2026.html', exists: true },
  { id: 69, file: 'ai-brand-monitoring-sentiment-2026.html', exists: true },
  { id: 70, file: 'ai-chatbot-conversation-design-2026.html', exists: true },
  
  // Group 3: Voice & Recommendations (11-15)
  { id: 71, file: 'best-ai-voice-generators-2026.html', exists: true, note: 'Expand to voice assistants' },
  { id: 72, file: 'ai-recommendation-engine-ecommerce-2026.html', exists: false, create: true },
  { id: 73, file: 'ai-hotel-revenue-pricing-2026.html', exists: true, note: 'Generalize to retail/ecommerce' },
  { id: 74, file: 'best-ai-inventory-management-tools.html', exists: true },
  { id: 75, file: 'ai-supply-chain-visibility-2026.html', exists: true },
  
  // Group 4: Logistics & Fraud (16-20)
  { id: 76, file: 'ai-tools-for-logistics-shipping-2026.html', exists: true },
  { id: 77, file: 'ai-claims-processing-fraud-detection.html', exists: true, note: 'Adapt to ecommerce fraud' },
  { id: 78, file: 'ai-image-recognition-retail-2026.html', exists: false, create: true },
  { id: 79, file: 'ai-visual-search-shopping-2026.html', exists: false, create: true },
  { id: 80, file: 'ai-product-description-ecommerce-2026.html', exists: true },
];

// Methodology enhancements to apply
const ENHANCEMENTS = {
  updateDate: '2026-03-20',
  imageCount: 4,
  comparisonBoxes: 2,
  faqCount: 7,
  internalLinks: 4,
  wordCountTarget: 3000,
  eatSignals: true,
  specificNumbers: true,
  scenarioOpening: true,
};

async function checkArticleStatus() {
  console.log('📊 Batch 5 Article Status Check\n');
  console.log('Total articles: 20');
  console.log('════════════════════════════════════════\n');
  
  let existing = 0;
  let missing = 0;
  
  for (const article of BATCH_5_ARTICLES) {
    const filepath = path.join(ARTICLES_DIR, article.file);
    try {
      await fs.access(filepath);
      console.log(`✅ #${article.id}: ${article.file}${article.note ? ' (' + article.note + ')' : ''}`);
      existing++;
    } catch (error) {
      console.log(`❌ #${article.id}: ${article.file} [NEEDS CREATION]`);
      missing++;
    }
  }
  
  console.log(`\n════════════════════════════════════════`);
  console.log(`Existing: ${existing}/20`);
  console.log(`Need creation: ${missing}/20`);
  console.log(`\nNext step: Run with --rewrite flag to enhance existing articles`);
  console.log(`Then run with --create flag to generate missing articles`);
}

async function analyzeArticle(filepath) {
  const content = await fs.readFile(filepath, 'utf-8');
  
  // Count current word count (rough estimate from body text)
  const bodyMatch = content.match(/<div class="article-content">([\s\S]*?)<\/div>/);
  const bodyText = bodyMatch ? bodyMatch[1].replace(/<[^>]+>/g, '') : '';
  const words = bodyText.trim().split(/\s+/).filter(w => w.length > 0).length;
  
  // Count images
  const images = (content.match(/<img /g) || []).length;
  
  // Check for comparison boxes
  const comparisonBoxes = (content.match(/comparison-box/g) || []).length;
  
  // Count FAQs
  const faqs = (content.match(/<div class="highlight-box">[\s\S]*?<h4>/g) || []).length;
  
  // Check modified date
  const modifiedMatch = content.match(/dateModified":"(\d{4}-\d{2}-\d{2})/);
  const lastModified = modifiedMatch ? modifiedMatch[1] : 'unknown';
  
  return {
    wordCount: words,
    imageCount: images,
    comparisonBoxes,
    faqCount: faqs,
    lastModified,
    needsEnhancement: words < 2500 || images < 4 || comparisonBoxes < 2 || faqs < 5
  };
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--status') || args.length === 0) {
    await checkArticleStatus();
    return;
  }
  
  if (args.includes('--analyze')) {
    console.log('\n📊 Analyzing existing articles...\n');
    for (const article of BATCH_5_ARTICLES.filter(a => a.exists)) {
      const filepath = path.join(ARTICLES_DIR, article.file);
      try {
        const analysis = await analyzeArticle(filepath);
        console.log(`#${article.id}: ${article.file}`);
        console.log(`  Words: ${analysis.wordCount} | Images: ${analysis.imageCount} | Comparison boxes: ${analysis.comparisonBoxes} | FAQs: ${analysis.faqCount}`);
        console.log(`  Last modified: ${analysis.lastModified}`);
        console.log(`  ${analysis.needsEnhancement ? '⚠️  NEEDS ENHANCEMENT' : '✅ GOOD'}\n`);
      } catch (error) {
        console.log(`  ❌ Error analyzing: ${error.message}\n`);
      }
    }
    return;
  }
  
  console.log('Usage:');
  console.log('  node rewrite-batch5.js --status     # Check which articles exist');
  console.log('  node rewrite-batch5.js --analyze    # Analyze existing articles');
  console.log('  node rewrite-batch5.js --rewrite    # (TODO) Enhance existing articles');
  console.log('  node rewrite-batch5.js --create     # (TODO) Create missing articles');
}

main().catch(console.error);
